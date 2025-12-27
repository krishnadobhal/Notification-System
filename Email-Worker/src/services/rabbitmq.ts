import { rabbitMQ } from "@/client/rabbitmq.ts";
import dotenv from "dotenv";
import { SendMailNotification } from "./sendMail.ts";
import { EmailNotificationMessage } from "@/types/index.ts";
import { send } from "process";
import { sendMessageToEmailQueue } from "./message.ts";

dotenv.config();

const MAX_RETRY_COUNT = process.env.MAX_RETRY_COUNT ? parseInt(process.env.MAX_RETRY_COUNT) : 3;

export async function startEmailConsumer() {
    const channel = rabbitMQ.getChannel();
    const Mainqueue = process.env.EMAIL_QUEUE || "Email-Queue";

    await channel.consume(Mainqueue, async (msg) => {
        if (!msg) return;
        const messageContent = msg.content.toString();
        const notification: EmailNotificationMessage = JSON.parse(messageContent);

        const result = await SendMailNotification(notification);
        // Successful send
        if (result.success) {
            console.log(`Email sent successfully to ${notification.to} after ${result.attempts} attempts.`);
        }

        // Failed send with max retries reached
        if (result.attempts > MAX_RETRY_COUNT || notification.retryCount === undefined) {
            console.log(`Max retry attempts reached for email: ${notification.to}. Discarding message.`);
            channel.nack(msg, false, false); // Discard the message, send to dead-letter queue
            return;
        }
        // Successful send with retries left
        else if (result.attempts <= MAX_RETRY_COUNT) {
            console.log(`Scheduling retry ${result.attempts} for email: ${notification.to}`);
            const updatedNotification = {
                ...notification,
                retryCount: result.attempts
            };
            sendMessageToEmailQueue(updatedNotification, 5 * 60 * 1000);
            console.log(`Received message for email: ${notification.to}`);
            channel.ack(msg);
        };
    }
        , { noAck: false });

    console.log(`Email Consumer started, waiting for messages in ${Mainqueue}...`);
} 