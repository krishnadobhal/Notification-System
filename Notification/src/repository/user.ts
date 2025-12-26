import { pool } from "@/client/db.ts";



export const GetUserPreferences = async (userId: number) => {
    const query = 'SELECT email_notifications, sms_notifications FROM notification_preferences WHERE user_id = $1';
    const values = [userId];
    const res = await pool.query(query, values);
    return res.rows[0];
}