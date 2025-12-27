import { rabbitMQ } from "@/client/rabbitmq.ts";
import { NotificationMessage } from "@/types/index.ts";



export function sendMessage(payload: NotificationMessage, queue: string, delay = 0) {
    const channel = rabbitMQ.getChannel();

    channel.publish(
        'notification-delayed-exchange',
        queue,
        Buffer.from(JSON.stringify(payload)),
        {
            persistent: true,
            headers: {
                'x-delay': delay,
            },
        }
    );

    console.log(`Email sent (delay: ${delay}ms)`);
}

export async function sendRaw(queue: string, rawMessage: any) {
    const channel = rabbitMQ.getChannel();
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(rawMessage)), { persistent: true });
    console.log(`Sent raw message to ${queue}: ${JSON.stringify(rawMessage)}`);
}