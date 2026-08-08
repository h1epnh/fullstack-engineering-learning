"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_migrate_shared_1 = require("db-migrate-shared");
const no_logger_1 = __importDefault(require("../../test/fixtures/no-logger"));
const database_init_1 = __importDefault(require("../../test/e2e/helpers/database-init"));
const migrator_1 = require("../../migrator");
db_migrate_shared_1.log.setLogLevel('error');
let db;
afterAll(async () => {
    await db.destroy();
});
test('System user creation migration correctly sets is_system', async () => {
    jest.setTimeout(15000);
    db = await (0, database_init_1.default)('system_user_migration', no_logger_1.default, {
        stopMigrationAt: '20231221143955-feedback-table.js',
        dbInitMethod: 'legacy',
    });
    await db.rawDatabase.raw(`
        INSERT INTO "users"
            (name, username, email, created_by_user_id)
        VALUES
            ('Test Person', 'testperson', 'testperson@getunleash.io', 1);
    `);
    // Run the migration
    await (0, migrator_1.migrateDb)(db.config, '20231222071533-unleash-system-user.js');
    // Check the results
    const { rows: userResults } = await db.rawDatabase.raw(`
        SELECT * FROM "users" ORDER BY id;
    `);
    console.log(userResults.map((r) => `${r.username} (${r.id})`));
    expect(userResults.length).toEqual(2);
    expect(userResults[0].is_system).toEqual(true);
    expect(userResults[0].id).toEqual(-1337);
    expect(userResults[0].username).toEqual('unleash_system_user');
    expect(userResults[1].is_system).toEqual(false);
    expect(userResults[1].id).toEqual(1);
    expect(userResults[1].username).toEqual('testperson');
});
//# sourceMappingURL=system-user-migration.test.js.map