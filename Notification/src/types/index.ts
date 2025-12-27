import { z } from 'zod';


export type NotificationKind =
    | 'Video_Processing_Complete'
    | 'Video_Processing_Failed'
    | 'Video_Audio_Transcription_Complete'
    | 'Video_Audio_Transcription_Failed'
export interface EmailNotificationMessage {
    type: 'email' | 'sms';
    priority: 'low' | 'high';
    to: string;
    content: string;
    timestamp: number;
    subject: string;
    retryCount: number;
}

export interface SmsNotificationMessage {
    type: 'email' | 'sms';
    priority: 'low' | 'high';
    to: string;
    content: string;
    timestamp: number;
    retryCount: number;
}
export interface KafkaNotificationMessage {
    // timestamp: number;
    userId: string;
    type: 'email' | 'sms';
    priority: 'low' | 'high';
    to: string;
    action_url?: string;
    notification: NotificationKind;
}



export const KafkaNotificationSchema = z.object({
    userId: z.string(),
    type: z.enum(['email', 'sms']),
    priority: z.enum(['low', 'high']),
    action_url: z.string().optional(),
    to: z.string(),
    notification: z.enum([
        'Video_Processing_Complete',
        'Video_Processing_Failed',
        'Video_Audio_Transcription_Complete',
        'Video_Audio_Transcription_Failed'
    ]),
});