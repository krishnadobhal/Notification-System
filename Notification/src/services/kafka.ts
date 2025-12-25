import KafkaConfig from "@/client/kafka.ts";
import { NotificationMessage } from "@/types/index.ts";
import { HandleMessage } from "./message.ts";

const kafkaConfig = new KafkaConfig();

const startConsumer = async () => {
    // Ensure consumer is connected and subscribed before running
    await kafkaConfig.consumer.connect();
    await kafkaConfig.consumer.subscribe({ topic: "Notification", fromBeginning: true });

    await kafkaConfig.consumer.run({
        autoCommit: false, // Disable auto commit

        // Use autoCommit: false for manual offset control if needed
        eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
            console.log({
                key: message.key?.toString(),
                value: message.value?.toString(),
                headers: message.headers,
            });
            const messageValue: NotificationMessage = message.value ? JSON.parse(message.value.toString()) : {};
            await HandleMessage(messageValue);

            // Manually commit the offset after processing
            await kafkaConfig.consumer.commitOffsets([
                { topic, partition, offset: (BigInt(message.offset) + 1n).toString() }
            ]);
        }
    });
}
export default startConsumer;