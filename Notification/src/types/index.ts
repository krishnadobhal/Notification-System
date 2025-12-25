export interface NotificationMessage {
    userId: string;
    content: string;
    timestamp: number;
    type: 'email' | 'sms';
    priority: 'low' | 'high';
    action_url?: string;
}