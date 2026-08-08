"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../test/e2e/helpers/database-init"));
const no_logger_1 = __importDefault(require("../../test/fixtures/no-logger"));
const db_migrate_shared_1 = require("db-migrate-shared");
const pg_1 = require("pg");
const migrator_1 = require("../../migrator");
db_migrate_shared_1.log.setLogLevel('error');
async function validateTablesHavePrimaryKeys(db) {
    const client = new pg_1.Client(db);
    await client.connect();
    const tables = await client.query(`SELECT 
        t.table_name
    FROM 
        information_schema.tables t
    LEFT JOIN 
        information_schema.table_constraints tc ON t.table_schema = tc.table_schema
        AND t.table_name = tc.table_name
        AND tc.constraint_type = 'PRIMARY KEY'
    WHERE 
        t.table_type = 'BASE TABLE'
        AND t.table_schema NOT IN ('pg_catalog', 'information_schema')
        AND tc.constraint_name IS NULL;
    `);
    await client.end();
    if ((tables.rowCount ?? 0) > 0) {
        throw new Error(`The following tables do not have a primary key defined: ${tables.rows
            .map((r) => r.table_name)
            .join(', ')}`);
    }
}
let db;
afterAll(async () => {
    await db.destroy();
});
test('Up & down migrations work', async () => {
    db = await (0, database_init_1.default)('system_user_migration', no_logger_1.default);
    // up migration is performed at the beginning of tests
    // here we just validate that the tables have primary keys
    await validateTablesHavePrimaryKeys(db.config.db);
    // then we test down migrations
    await (0, migrator_1.resetDb)(db.config);
});
//# sourceMappingURL=migrator.e2e.test.js.map