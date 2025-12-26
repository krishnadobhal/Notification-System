import { NotificationMessage } from "@/types/index.ts";

export const SendMailNotification = async (notification: NotificationMessage) => {
    // Simulate sending an email
    console.log(`Sending email to ${notification.to} with content: ${notification.content}`);
    // Here you would integrate with an actual email service provider
}