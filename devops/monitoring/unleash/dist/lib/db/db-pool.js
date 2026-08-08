"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDb = createDb;
const knex_1 = require("knex");
function createDb({ db, getLogger, }) {
    const logger = getLogger('db-pool.js');
    return (0, knex_1.knex)({
        client: 'pg',
        version: db.version,
        connection: {
            ...db,
            application_name: db.applicationName,
        },
        pool: db.pool,
        searchPath: db.schema,
        asyncStackTraces: true,
        log: {
            debug: (msg) => logger.debug(msg),
            warn: (msg) => logger.warn(msg),
            error: (msg) => logger.error(msg),
        },
    });
}
// for backward compatibility
module.exports = {
    createDb,
};
//# sourceMappingURL=db-pool.js.map