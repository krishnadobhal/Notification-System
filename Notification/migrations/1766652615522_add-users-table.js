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
    pgm.createTable('users', {
        id: { type: 'serial', primaryKey: true },
        username: { type: 'varchar(100)', notNull: true, unique: true },
        email: { type: 'varchar(255)', notNull: true, unique: true },
        created_at: { type: 'timestamp', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => { };
