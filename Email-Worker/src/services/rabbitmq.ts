import { rabbitMQ } from "@/client/rabbitmq.ts";
import { NotificationMessage } from "@/types/index.ts";
import dotenv from "dotenv";
import { SendMailNotification } from "./sendMail.ts";

dotenv.config();

export async function sendMessage(queueMessage: NotificationMessage, queue: string) {
    const channel = rabbitMQ.getChannel();
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(queueMessage)), { persistent: true });
    console.log(`Sent: ${JSON.stringify(queueMessage)}`);
}

export async function startEmailConsumer() {
    const channel = rabbitMQ.getChannel();
    const queue = process.env.EMAIL_QUEUE || "Email-Queue";

    const res = await channel.consume(queue, async (msg) => {
        if (!msg) return;
        const messageContent = msg.content.toString();
        const notification: NotificationMessage = JSON.parse(messageContent);
        console.log(`Received message for email: ${notification.to}`);
        await SendMailNotification(notification);
        channel.ack(msg);
    });
} 