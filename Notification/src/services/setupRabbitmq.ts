import { rabbitMQ } from "@/client/rabbitmq.ts";

export async function setupQueues() {
    const channel = rabbitMQ.getChannel();

    await channel.assertExchange('dlx', 'direct', { durable: true });

    await channel.assertExchange(
        'notification-delayed-exchange',
        'x-delayed-message',
        {
            durable: true,
            arguments: {
                'x-delayed-type': 'direct',
            },
        }
    );

    await channel.assertQueue('Email-Queue', {
        durable: true,
        arguments: {
            'x-dead-letter-exchange': 'dlx',
            'x-dead-letter-routing-key': 'email.dlq',
        },
    });

    await channel.assertQueue('SMS-Queue', {
        durable: true,
        arguments: {
            'x-dead-letter-exchange': 'dlx',
            'x-dead-letter-routing-key': 'sms.dlq',
        },
    });

    await channel.assertQueue('Email-DLQ', { durable: true });
    await channel.assertQueue('SMS-DLQ', { durable: true });


    // Main queues (after delay)
    await channel.bindQueue(
        'Email-Queue',
        'notification-delayed-exchange',
        'email'
    );

    await channel.bindQueue(
        'SMS-Queue',
        'notification-delayed-exchange',
        'sms'
    );

    // DLQs
    await channel.bindQueue('Email-DLQ', 'dlx', 'email.dlq');
    await channel.bindQueue('SMS-DLQ', 'dlx', 'sms.dlq');

    console.log('Queues + DLQ setup completed');
}