"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDbPrefix = void 0;
exports.default = init;
const db_migrate_shared_1 = require("db-migrate-shared");
const migrator_1 = require("../../../migrator");
const db_1 = require("../../../lib/db");
const db_pool_1 = require("../../../lib/db/db-pool");
const database_config_1 = require("./database-config");
const test_config_1 = require("../../config/test-config");
const database_json_1 = __importDefault(require("./database.json"));
const no_logger_1 = __importDefault(require("../../fixtures/no-logger"));
const constants_1 = require("../../../lib/util/constants");
const pg_1 = require("pg");
const uuid_1 = require("uuid");
// require('db-migrate-shared').log.silence(false);
// because of db-migrate bug (https://github.com/Unleash/unleash/issues/171)
process.setMaxListeners(0);
exports.testDbPrefix = 'unleashtestdb_';
async function getDefaultEnvRolePermissions(knex) {
    return knex.table('role_permission').whereIn('environment', ['default']);
}
async function restoreRolePermissions(knex, rolePermissions) {
    await knex.table('role_permission').insert(rolePermissions);
}
async function resetDatabase(knex) {
    return Promise.all([
        knex
            .table('environments')
            .del(), // deletes role permissions transitively
        knex.table('strategies').del(),
        knex.table('features').del(),
        knex.table('client_applications').del(),
        knex.table('client_instances').del(),
        knex.table('context_fields').del(),
        knex.table('users').del(),
        knex.table('projects').del(),
        knex.table('tags').del(),
        knex.table('tag_types').del(),
        knex.table('addons').del(),
        knex.table('users').del(),
        knex.table('api_tokens').del(),
        knex.table('api_token_project').del(),
        knex
            .table('reset_tokens')
            .del(),
        // knex.table('settings').del(),
    ]);
}
function createStrategies(store) {
    return database_json_1.default.strategies.map((s) => store.createStrategy(s));
}
function createContextFields(store) {
    return database_json_1.default.contextFields.map((c) => store.create(c));
}
function createProjects(store) {
    return database_json_1.default.projects.map((i) => store.create(i));
}
function createTagTypes(store) {
    return database_json_1.default.tag_types.map((t) => store.createTagType(t));
}
async function connectProject(store) {
    await store.connectProject(constants_1.DEFAULT_ENV, 'default');
}
async function createEnvironments(store) {
    await Promise.all(database_json_1.default.environments.map(async (e) => store.create(e)));
}
async function setupDatabase(stores) {
    await createEnvironments(stores.environmentStore);
    await Promise.all(createStrategies(stores.strategyStore));
    await Promise.all(createContextFields(stores.contextFieldStore));
    await Promise.all(createProjects(stores.projectStore));
    await Promise.all(createTagTypes(stores.tagTypeStore));
    await connectProject(stores.featureEnvironmentStore);
}
async function init(databaseSchema = 'test', getLogger = no_logger_1.default, configOverride = {}) {
    const testDbName = `${exports.testDbPrefix}${(0, uuid_1.v4)().replace(/-/g, '')}`;
    const useDbTemplate = (configOverride.dbInitMethod ?? 'template') === 'template';
    const testDBTemplateName = process.env.TEST_DB_TEMPLATE_NAME;
    const config = (0, test_config_1.createTestConfig)({
        db: {
            ...(0, database_config_1.getDbConfig)(),
            pool: { min: 1, max: 4 },
            ...(useDbTemplate
                ? { database: testDbName }
                : { schema: databaseSchema }),
            ssl: false,
        },
        ...configOverride,
        getLogger,
    });
    db_migrate_shared_1.log.setLogLevel('error');
    if (useDbTemplate) {
        if (!testDBTemplateName) {
            throw new Error('TEST_DB_TEMPLATE_NAME environment variable is not set');
        }
        const client = new pg_1.Client((0, database_config_1.getDbConfig)());
        await client.connect();
        await client.query(`CREATE DATABASE ${testDbName} TEMPLATE ${testDBTemplateName}`);
        await client.query(`ALTER DATABASE ${testDbName} SET TIMEZONE TO UTC`);
        await client.end();
    }
    else {
        const db = (0, db_pool_1.createDb)(config);
        await db.raw(`DROP SCHEMA IF EXISTS ${config.db.schema} CASCADE`);
        await db.raw(`CREATE SCHEMA IF NOT EXISTS ${config.db.schema}`);
        await (0, migrator_1.migrateDb)(config, configOverride.stopMigrationAt);
        await db.destroy();
    }
    const testDb = (0, db_pool_1.createDb)(config);
    const stores = (0, db_1.createStores)(config, testDb);
    stores.eventStore.setMaxListeners(0);
    if (!useDbTemplate) {
        const defaultRolePermissions = await getDefaultEnvRolePermissions(testDb);
        await resetDatabase(testDb);
        await setupDatabase(stores);
        await restoreRolePermissions(testDb, defaultRolePermissions);
    }
    return {
        config,
        rawDatabase: testDb,
        stores,
        reset: async () => {
            if (!useDbTemplate) {
                const defaultRolePermissions = await getDefaultEnvRolePermissions(testDb);
                await resetDatabase(testDb);
                await setupDatabase(stores);
                await restoreRolePermissions(testDb, defaultRolePermissions);
            }
        },
        destroy: async () => {
            return new Promise((resolve, reject) => {
                testDb.destroy((error) => (error ? reject(error) : resolve()));
            });
        },
    };
}
module.exports = init;
//# sourceMappingURL=database-init.js.map