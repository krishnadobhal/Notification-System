import { KafkaNotificationMessage } from "@/types/index.ts";
import { EMAIL_CONTENT } from "./messageContent.ts";

function renderTemplate(
    template: string,
    data: Record<string, string | undefined>
) {
    return template.replace(/{{(\w+)}}/g, (_, key) => {
        return data[key] ?? '';
    });
}


export const giveEmailContent = (msg: KafkaNotificationMessage) => {
    const template = EMAIL_CONTENT[msg.notification];
    if (!template) {
        throw new Error('Unknown notification type');
    }
    const body = renderTemplate(template.body, {
        action_url: msg.action_url,
    });
    return {
        subject: template.subject,
        content: body,
    };
}

export const giveSmsContent = (msg: KafkaNotificationMessage) => {
    const template = EMAIL_CONTENT[msg.notification];
    if (!template) {
        throw new Error('Unknown notification type');
    }
    const content = renderTemplate(template.body, {
        action_url: msg.action_url,
    });
    return {
        content,
    };
}
