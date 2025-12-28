import KafkaConfig from "@/client/kafka.ts";
import { HandleMessage } from "./message.ts";
import { sendRaw } from "./rabbitmq.ts";
import { KafkaNotificationMessage, KafkaNotificationSchema } from "@/types/index.ts";
import redisClient from "@/client/redis.ts";


const kafkaConfig = new KafkaConfig();

const startConsumer = async () => {
    await kafkaConfig.consumer.connect();
    await kafkaConfig.consumer.subscribe({ topic: "Notification", fromBeginning: true });

    await kafkaConfig.consumer.run({
        autoCommit: false,
        eachBatchAutoResolve: false, // We will manage commits manually
        eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning }) => {

            // Process messages concurrently
            const promises = batch.messages.map(async (message) => {
                if (!isRunning()) return;

                try {
                    const rawValue = message.value ? JSON.parse(message.value.toString()) : {};
                    const result = KafkaNotificationSchema.safeParse(rawValue);

                    // If validation fails, send to RabbitMQ error queue
                    if (!result.success) {
                        sendRaw("NotificationErrors", { error: "Invalid notification message", details: result.error.cause, rawMessage: rawValue });
                        resolveOffset(message.offset);
                        return;
                    }
                    const notificationData = result.data;
                    const messageId = notificationData.id;

                    const idempotencyKey = `processed:${messageId}`;

                    // if message already exist, it will return null, otherwise set the key and proceed
                    const isNewMessage = await redisClient.set(idempotencyKey, 'true', {
                        NX: true,
                        EX: 60 * 60 * 24
                    });


                    if (!isNewMessage) {
                        console.log(`Duplicate message detected and skipped: ${messageId}`);
                        resolveOffset(message.offset);
                        return;
                    }
                    // Process the valid message
                    await HandleMessage(result.data);

                    // Mark this specific offset as processed
                    resolveOffset(message.offset);
                } catch (err) {
                    console.error(`Error processing message offset ${message.offset}:`, err);
                    sendRaw("NotificationErrors", { error: "Invalid notification message", details: err, rawMessage: message.value ? message.value.toString() : null });
                }
            });

            // Wait for all messages in this batch to finish
            await Promise.all(promises);

            // Heartbeat to keep connection alive during long batches
            await heartbeat();
        }
    });
}
export default startConsumer;