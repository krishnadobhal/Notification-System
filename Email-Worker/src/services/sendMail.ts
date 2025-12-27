import { EmailNotificationMessage } from "@/types/index.ts";

export const SendMailNotification = async (notification: EmailNotificationMessage) => {
    // Simulate sending an email
    const attempts = notification.retryCount + 1;
    try {
        console.log(`Sending email to ${notification.to} with content: ${notification.content}`);
        // Here you would integrate with an actual email service provider
        return { success: true, attempts };
    }
    catch (error) {
        console.error(`Failed to send email to ${notification.to}:`, error);
        return { success: false, attempts };
    }
}