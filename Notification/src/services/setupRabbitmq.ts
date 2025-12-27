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

    await channel.assertQueue('Email-Retry-Queue', {
        durable: true,
        arguments: {
            'x-dead-letter-exchange': 'notification-delayed-exchange',
            'x-dead-letter-routing-key': 'email',
        },
    });
    await channel.assertQueue('SMS-Retry-Queue', {
        durable: true,
        arguments: {
            'x-dead-letter-exchange': 'notification-delayed-exchange',
            'x-dead-letter-routing-key': 'sms',
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

    // Retry queues
    await channel.bindQueue(
        'Email-Retry-Queue',
        'notification-retry-exchange',
        'email-retry'
    );
    await channel.bindQueue(
        'SMS-Retry-Queue',
        'notification-retry-exchange',
        'sms-retry'
    );

    // DLQs
    await channel.bindQueue('Email-DLQ', 'dlx', 'email.dlq');
    await channel.bindQueue('SMS-DLQ', 'dlx', 'sms.dlq');

    console.log('Queues + DLQ setup completed');
}