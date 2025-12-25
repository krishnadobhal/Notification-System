import { rabbitMQ } from "@/client/rabbitmq.ts";
import { NotificationMessage } from "@/types/index.ts";

export async function sendMessage(queueMessage: NotificationMessage, queue: string) {
    const channel = rabbitMQ.getChannel();
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(queueMessage)), { persistent: true });
    console.log(`Sent: ${JSON.stringify(queueMessage)}`);
}

export async function sendRaw(queue: string, rawMessage: any) {
    const channel = rabbitMQ.getChannel();
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(rawMessage)), { persistent: true });
    console.log(`Sent raw message to ${queue}: ${JSON.stringify(rawMessage)}`);
}