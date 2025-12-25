import { rabbitMQ } from './rabbitmq.ts';
import startConsumer from '@/services/kafka.ts';
import redisClient from './redis.ts';



async function connectClients() {
    await redisClient.connect();
    console.log('Redis connected');
    await rabbitMQ.connect();
    console.log('RabbitMQ connected');
    await startConsumer();
    console.log('Kafka consumer started');
}
export { connectClients };