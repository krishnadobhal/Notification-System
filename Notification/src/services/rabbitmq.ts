import { rabbitMQ } from "@/client/rabbitmq.ts";
import { EmailNotificationMessage, KafkaNotificationMessage, SmsNotificationMessage } from "@/types/index.ts";
import { giveEmailContent, giveSmsContent } from "@/utils/templateGenrate.ts";


export function sendMessage(payload: KafkaNotificationMessage, type: 'email' | 'sms', delay = 0) {
    if (type === 'email') {
        const content = giveEmailContent(payload);
        delete (payload as any).userId;
        sendMessageToEmailQueue({ ...payload, ...content, timestamp: Date.now() } as EmailNotificationMessage, delay);
    } else if (type === 'sms') {
        const content = giveSmsContent(payload);
        delete (payload as any).userId;
        sendMessageToSMSQueue({ ...payload, ...content, timestamp: Date.now() } as SmsNotificationMessage, delay);
    }
}

export function sendMessageToEmailQueue(payload: EmailNotificationMessage, delay = 0) {
    const channel = rabbitMQ.getChannel();

    channel.publish(
        'notification-delayed-exchange',
        'email',
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

export function sendMessageToSMSQueue(payload: SmsNotificationMessage, delay = 0) {
    const channel = rabbitMQ.getChannel();
    channel.publish(
        'notification-delayed-exchange',
        'sms',
        Buffer.from(JSON.stringify(payload)),
        {
            persistent: true,
            headers: {
                'x-delay': delay,
            },
        }
    );
    console.log(`SMS sent (delay: ${delay}ms)`);
}

export async function sendRaw(queue: string, rawMessage: any) {
    const channel = rabbitMQ.getChannel();
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(rawMessage)), { persistent: true });
    console.log(`Sent raw message to ${queue}: ${JSON.stringify(rawMessage)}`);
}