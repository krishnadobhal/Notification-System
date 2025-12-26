import { z } from 'zod';

export interface NotificationMessage {
    userId: string;
    content: string;
    timestamp: number;
    type: 'email' | 'sms';
    priority: 'low' | 'high';
    action_url?: string;
    to: string;
}


export const NotificationSchema = z.object({
    userId: z.string(),
    content: z.string(),
    timestamp: z.number(),
    type: z.enum(['email', 'sms']),
    priority: z.enum(['low', 'high']),
    action_url: z.string().optional(),
    to: z.string(),
});