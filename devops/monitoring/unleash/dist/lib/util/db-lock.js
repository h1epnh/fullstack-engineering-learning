"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withDbLock = exports.defaultTimeout = exports.defaultLockKey = void 0;
const pg_1 = require("pg");
exports.defaultLockKey = 479341;
exports.defaultTimeout = 30 * 60000;
const defaultOptions = {
    timeout: exports.defaultTimeout,
    lockKey: exports.defaultLockKey,
    logger: { ...console, fatal: console.error },
};
const withDbLock = (dbConfig, config = defaultOptions) => (fn) => async (...args) => {
    const client = new pg_1.Client({
        ...dbConfig,
    });
    let lockAcquired = false;
    try {
        await client.connect();
        // wait to obtain a lock
        await client.query('SELECT pg_advisory_lock($1)', [config.lockKey]);
        lockAcquired = true;
        const promise = fn(...args);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Query read timeout')), config.timeout));
        const result = (await Promise.race([promise, timeoutPromise]));
        return result;
    }
    catch (e) {
        config.logger.error(`Locking error: ${e.message}`);
        throw e;
    }
    finally {
        if (lockAcquired) {
            await client.query('SELECT pg_advisory_unlock($1)', [
                config.lockKey,
            ]);
        }
        await client.end();
    }
};
exports.withDbLock = withDbLock;
//# sourceMappingURL=db-lock.js.map