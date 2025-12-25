/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createTable('notification_preferences', {
        id: { type: 'serial', primaryKey: true },
        user_id: { type: 'integer', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
        email_notifications: { type: 'boolean', notNull: true, default: true },
        sms_notifications: { type: 'boolean', notNull: true, default: false },
        created_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
        updated_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => { };
