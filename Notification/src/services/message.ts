import { GetUserPreferences } from "@/repository/user.ts";
import { KafkaNotificationMessage } from "@/types/index.ts";
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
    message: KafkaNotificationMessage
): Promise<void> => {
    const { userId, type: channels, priority } = message;

    const userPreferences = await GetUserPreferences(Number(userId));
    if (!userPreferences) {
        console.log(`No preferences for user ${userId}`);
        return;
    }

    for (const channelType of channels) {
        const channel = CHANNEL_CONFIG[channelType];

        if (!channel) {
            console.log(`Unknown notification type: ${channelType}`);
            continue;
        }

        if (!channel.enabled(userPreferences)) {
            console.log(`User ${userId} opted out of ${channelType}`);
            continue;
        }

        const isLimited = await isRateLimited(
            Number(userId),
            channelType,
            channel.limit.max,
            channel.limit.time
        );

        // Bypass rate limit only for HIGH priority
        if (isLimited && priority !== "high") {
            console.log(`Rate limited ${channelType} for user ${userId}`);
            sendMessage(message, channelType, channel.delayOnLimit);
            continue;
        }

        // Send immediately
        sendMessage(message, channelType);
    }
};
