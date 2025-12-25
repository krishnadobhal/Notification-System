import { GetUserPreferences } from "@/repository/user.ts";
import { NotificationMessage } from "@/types/index.ts";
import { sendMessage } from "./rabbitmq.ts";
import { isRateLimited } from "./redisRatelimiter.ts";

export const HandleMessage = async (message: NotificationMessage): Promise<void> => {
    const { userId, type } = message;

    const userPreferences = await GetUserPreferences(Number(userId));
    if (!userPreferences) {
        console.log(`No preferences found for user ${userId}. Skipping.`);
        return;
    }

    // Channel-specific limits
    const limits = {
        email: { max: 5, time: 60 * 60 }, // 5 per hour
        sms: { max: 3, time: 60 * 60 }    // 3 per hour
    };

    const config = limits[type];

    if (!config) {
        console.log(`Unknown notification type: ${type}`);
        return;
    }

    const limited = await isRateLimited(
        Number(userId),
        type,
        config.max,
        config.time
    );

    if (limited && message.priority !== "high") {
        console.log(`Rate limit exceeded for ${type} user ${userId}`);
        return;
    }

    if (type === "email" && userPreferences.email_notifications) {
        console.log(`Sending email notification to user ${userId}`);
        await sendMessage(message, "Email-Queue");
        return;
    }

    if (type === "sms" && userPreferences.sms_notifications) {
        console.log(`Sending SMS notification to user ${userId}`);
        await sendMessage(message, "SMS-Queue");
        return;
    }

    console.log(`User ${userId} opted out of ${type}`);
};
