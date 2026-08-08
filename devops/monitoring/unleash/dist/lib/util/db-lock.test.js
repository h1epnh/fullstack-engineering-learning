"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_lock_1 = require("./db-lock");
const database_config_1 = require("../../test/e2e/helpers/database-config");
test('should lock access to any action', async () => {
    const lock = (0, db_lock_1.withDbLock)((0, database_config_1.getDbConfig)());
    const asyncAction = (input) => Promise.resolve(`result: ${input}`);
    const result = await lock(asyncAction)('data');
    expect(result).toBe('result: data');
});
const ms = (millis) => new Promise((resolve) => {
    setTimeout(() => resolve('time'), millis);
});
test('should await other actions on lock', async () => {
    const lock = (0, db_lock_1.withDbLock)((0, database_config_1.getDbConfig)());
    const results = [];
    const slowAsyncAction = (input) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                results.push(input);
                resolve(input);
            }, 200);
        });
    };
    const fastAction = async (input) => {
        results.push(input);
    };
    const lockedAction = lock(slowAsyncAction);
    const lockedAnotherAction = lock(fastAction);
    // deliberately skipped await to simulate another server running slow operation
    lockedAction('first');
    await ms(100); // start fast action after slow action established DB connection
    await lockedAnotherAction('second');
    expect(results).toStrictEqual(['first', 'second']);
});
test('should handle lock timeout', async () => {
    const timeoutMs = 10;
    let loggedError = '';
    const lock = (0, db_lock_1.withDbLock)((0, database_config_1.getDbConfig)(), {
        lockKey: 1,
        timeout: timeoutMs,
        logger: {
            error(msg) {
                loggedError = msg;
            },
        },
    });
    const asyncAction = () => ms(100);
    await expect(lock(asyncAction)()).rejects.toStrictEqual(new Error('Query read timeout'));
    expect(loggedError).toBe('Locking error: Query read timeout');
});
//# sourceMappingURL=db-lock.test.js.map