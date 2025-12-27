import { GetUserPreferences } from "@/repository/user.ts";
import { NotificationMessage } from "@/types/index.ts";
import { sendMessage } from "./rabbitmq.ts";
import { isRateLimited } from "./redisRatelimiter.ts";

const CHANNEL_CONFIG = {
    email: {
        enabled: (prefs: any) => prefs.email_notifications,
        limit: { max: 5, time: 60 * 60 },
        delayOnLimit: 30 * 60 * 1000 // 30 minutes
    },
    sms: {
        enabled: (prefs: any) => prefs.sms_notifications,
        limit: { max: 3, time: 60 * 60 },
        delayOnLimit: 30 * 60 * 1000 // 30 minutes
    }
} as const;


export const HandleMessage = async (
    message: NotificationMessage
): Promise<void> => {
    const { userId, type, priority } = message;

    const userPreferences = await GetUserPreferences(Number(userId));
    if (!userPreferences) {
        console.log(`No preferences for user ${userId}`);
        return;
    }

    // Determine channel config
    const channel = CHANNEL_CONFIG[type as keyof typeof CHANNEL_CONFIG];

    if (!channel) {
        console.log(`Unknown notification type: ${type}`);
        return;
    }

    if (!channel.enabled(userPreferences)) {
        console.log(`User ${userId} opted out of ${type}`);
        return;
    }

    const isLimited = await isRateLimited(
        Number(userId),
        type,
        channel.limit.max,
        channel.limit.time
    );

    // Bypass rate limit for low priority messages
    if (isLimited && priority !== "high") {
        console.log(`Rate limited ${type} for user ${userId}`);
        sendMessage(message, type, channel.delayOnLimit);
        return;
    }

    // Send the message immediately if not rate limited
    sendMessage(message, type);
};

