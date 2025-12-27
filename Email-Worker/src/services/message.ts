import { rabbitMQ } from "@/client/rabbitmq.ts";
import { EmailNotificationMessage } from "@/types/index.ts";

export function sendMessageToEmailQueue(payload: EmailNotificationMessage, delay = 0) {
    const channel = rabbitMQ.getChannel();

    channel.publish(
        'notification-retry-exchange',
        'email.retry',
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