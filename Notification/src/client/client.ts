import { rabbitMQ } from './rabbitmq.ts';
import startConsumer from '@/services/kafka.ts';
import redisClient from './redis.ts';
import { setupQueues } from '@/services/setupRabbitmq.ts';



async function connectClients() {
    await redisClient.connect();
    console.log('Redis connected');
    await rabbitMQ.connect();
    console.log('RabbitMQ connected');
    await setupQueues();
    console.log('RabbitMQ queues set up');
    await startConsumer();
    console.log('Kafka consumer started');
}
export { connectClients };