"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_config_1 = require("../../../test/config/test-config");
const job_store_1 = require("./job-store");
const job_service_1 = require("./job-service");
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
let db;
let store;
const config = (0, test_config_1.createTestConfig)();
beforeAll(async () => {
    db = await (0, database_init_1.default)('job_service_serial', config.getLogger);
    // @ts-ignore setMuteError is not part of getLogger interface
    config.getLogger.setMuteError(true);
    store = new job_store_1.JobStore(db.rawDatabase, config);
});
afterEach(async () => {
    await store.deleteAll();
});
afterAll(async () => {
    await db.destroy();
});
// note: this might be flaky if the test runs exactly at 59 minutes and 59 seconds of an hour and 999 milliseconds but should be unlikely
test('Only executes job once within time period', async () => {
    let counter = 0;
    const service = new job_service_1.JobService(store, config.getLogger);
    const job = service.singleInstance('test', async () => {
        counter++;
    }, 60);
    await job();
    await job();
    expect(counter).toBe(1);
    const jobs = await store.getAll();
    expect(jobs).toHaveLength(1);
    expect(jobs.every((j) => j.finishedAt !== null)).toBe(true);
    expect(jobs.every((j) => j.stage === 'completed')).toBe(true);
});
test('Will execute jobs with different keys', async () => {
    let counter = 0;
    let otherCounter = 0;
    const service = new job_service_1.JobService(store, config.getLogger);
    const incrementCounter = service.singleInstance('one', async () => {
        counter++;
    }, 60);
    const incrementOtherCounter = service.singleInstance('two', async () => {
        otherCounter++;
    }, 60);
    await incrementCounter();
    await incrementCounter();
    await incrementOtherCounter();
    await incrementOtherCounter();
    expect(counter).toBe(1);
    expect(otherCounter).toBe(1);
    const jobs = await store.getAll();
    expect(jobs).toHaveLength(2);
    expect(jobs.every((j) => j.finishedAt !== null)).toBe(true);
    expect(jobs.every((j) => j.stage === 'completed')).toBe(true);
});
test('When the provided function fails we record the failure', async () => {
    const service = new job_service_1.JobService(store, config.getLogger);
    const faultyJob = service.singleInstance('will-fail', async () => {
        throw new Error('fail');
    }, 60);
    await faultyJob();
    await faultyJob();
    const jobs = await store.getAll();
    expect(jobs).toHaveLength(1);
    expect(jobs.every((j) => j.finishedAt !== null)).toBe(true);
    expect(jobs.every((j) => j.stage === 'failed')).toBe(true);
});
//# sourceMappingURL=job-service.test.js.map