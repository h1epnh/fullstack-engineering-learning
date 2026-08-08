"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateDb = migrateDb;
exports.resetDb = resetDb;
const db_migrate_shared_1 = require("db-migrate-shared");
const db_migrate_1 = require("db-migrate");
const date_fns_1 = require("date-fns");
db_migrate_shared_1.log.setLogLevel('error');
async function noDatabaseUrl(fn) {
    // unset DATABASE_URL so it doesn't take presedence over the provided db config
    const dbUrlEnv = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    const result = fn();
    process.env.DATABASE_URL = dbUrlEnv;
    return result;
}
async function migrateDb({ db }, stopAt) {
    return noDatabaseUrl(async () => {
        const custom = {
            ...db,
            connectionTimeoutMillis: (0, date_fns_1.secondsToMilliseconds)(10),
        };
        // disable Intellij/WebStorm from setting verbose CLI argument to db-migrator
        process.argv = process.argv.filter((it) => !it.includes('--verbose'));
        const dbm = (0, db_migrate_1.getInstance)(true, {
            cwd: __dirname,
            config: { custom },
            env: 'custom',
        });
        return dbm.up(stopAt);
    });
}
// This exists to ease testing
async function resetDb({ db }) {
    return noDatabaseUrl(async () => {
        const custom = {
            ...db,
            connectionTimeoutMillis: (0, date_fns_1.secondsToMilliseconds)(10),
        };
        const dbm = (0, db_migrate_1.getInstance)(true, {
            cwd: __dirname,
            config: { custom },
            env: 'custom',
        });
        return dbm.reset();
    });
}
//# sourceMappingURL=migrator.js.map