import { rabbitMQ } from "@/client/rabbitmq.ts";

export async function setupQueues() {
    const channel = rabbitMQ.getChannel();

    await channel.assertExchange('dlx', 'direct', { durable: true });

    //! Delayed exchanges

    // Notification delayed exchange
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
    await channel.assertExchange(
        'notification-retry-exchange',
        'x-delayed-message',
        {
            durable: true, arguments: {
                'x-delayed-type': 'direct',
            },
        }
    )

    //! Main queues
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

    //! Bindings
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