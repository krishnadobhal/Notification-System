import redisClient from "@/client/redis.ts";

export async function isRateLimited(
    userId: number,
    type: "email" | "sms",
    limit: number,
    windowSeconds: number
): Promise<boolean> {
    const key = `rate:${type}:${userId}`;

    const current = await redisClient.incr(key);

    if (current === 1) {
        await redisClient.expire(key, windowSeconds);
    }

    return current > limit;
}
