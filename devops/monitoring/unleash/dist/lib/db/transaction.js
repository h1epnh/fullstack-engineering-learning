"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKnexTransactionStarter = void 0;
exports.inTransaction = inTransaction;
exports.withTransactional = withTransactional;
exports.withRollbackTransaction = withRollbackTransaction;
exports.withFakeTransactional = withFakeTransactional;
const createKnexTransactionStarter = (knex) => {
    function transaction(scope) {
        if (!knex) {
            console.warn('It looks like your DB is not provided. Very often it is a test setup problem in setupAppWithCustomConfig');
        }
        return knex.transaction(scope);
    }
    return transaction;
};
exports.createKnexTransactionStarter = createKnexTransactionStarter;
/**
 * @deprecated this is a temporary solution to deal with transactions at the store level.
 * Ideally, we should handle transactions at the service level (each service method should be transactional).
 * The controller should define the transactional scope as follows:
 * https://github.com/Unleash/unleash/blob/cb034976b93abc799df774858d716a49f645d669/src/lib/features/export-import-toggles/export-import-controller.ts#L206-L208
 *
 * To be able to use .transactional method, services should be instantiated like this:
 * https://github.com/Unleash/unleash/blob/cb034976b93abc799df774858d716a49f645d669/src/lib/services/index.ts#L282-L284
 *
 * This function makes sure that `fn` is executed in a transaction.
 * If the db is already in a transaction, it will execute `fn` in that transactional scope.
 *
 * https://github.com/knex/knex/blob/bbbe4d4637b3838e4a297a457460cd2c76a700d5/lib/knex-builder/make-knex.js#L143C5-L144C88
 */
async function inTransaction(db, fn) {
    if (db.isTransaction) {
        return fn(db);
    }
    return db.transaction(async (tx) => fn(tx));
}
function withTransactional(serviceFactory, db) {
    const service = serviceFactory(db);
    service.transactional = async (fn) => 
    // Maybe: inTransaction(db, async (trx: Knex.Transaction) => fn(serviceFactory(trx)));
    // this assumes that the caller didn't start a transaction already and opens a new one.
    db.transaction(async (trx) => {
        const transactionalService = serviceFactory(trx);
        return fn(transactionalService);
    });
    return service;
}
function withRollbackTransaction(serviceFactory, db) {
    const service = serviceFactory(db);
    service.rollbackTransaction = async (fn) => {
        const trx = await db.transaction();
        try {
            const transactionService = serviceFactory(trx);
            const result = await fn(transactionService);
            return result;
        }
        finally {
            await trx.rollback();
        }
    };
    return service;
}
/** Just for testing purposes */
function withFakeTransactional(service) {
    const serviceWithFakeTransactional = service;
    serviceWithFakeTransactional.transactional = async (fn) => fn(serviceWithFakeTransactional);
    return serviceWithFakeTransactional;
}
//# sourceMappingURL=transaction.js.map