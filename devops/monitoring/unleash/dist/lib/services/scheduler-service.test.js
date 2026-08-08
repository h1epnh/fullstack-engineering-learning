"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const scheduler_service_1 = require("../features/scheduler/scheduler-service");
const test_config_1 = require("../../test/config/test-config");
const fake_setting_store_1 = __importDefault(require("../../test/fixtures/fake-setting-store"));
const setting_service_1 = __importDefault(require("./setting-service"));
const maintenance_service_1 = __importDefault(require("../features/maintenance/maintenance-service"));
function ms(timeMs) {
    return new Promise((resolve) => setTimeout(resolve, timeMs));
}
const getLogger = () => {
    const records = [];
    const logger = () => ({
        error(...args) {
            records.push(args);
        },
        debug() { },
        info() { },
        warn() { },
        fatal() { },
    });
    const getRecords = () => {
        return records;
    };
    return { logger, getRecords };
};
let schedulerService;
let getRecords;
beforeEach(() => {
    const config = (0, test_config_1.createTestConfig)();
    const settingStore = new fake_setting_store_1.default();
    const settingService = new setting_service_1.default({ settingStore }, config, {
        storeEvent() { },
    });
    const maintenanceService = new maintenance_service_1.default(config, settingService);
    const { logger, getRecords: getRecordsFn } = getLogger();
    getRecords = getRecordsFn;
    schedulerService = new scheduler_service_1.SchedulerService(logger, maintenanceService, config.eventBus);
});
test('Schedules job immediately', async () => {
    const job = jest.fn();
    await schedulerService.schedule(job, 10, 'test-id');
    expect(job).toBeCalledTimes(1);
    schedulerService.stop();
});
test('Can schedule a single regular job', async () => {
    const job = jest.fn();
    await schedulerService.schedule(job, 50, 'test-id-3');
    await ms(75);
    expect(job).toBeCalledTimes(2);
    schedulerService.stop();
});
test('Can schedule multiple jobs at the same interval', async () => {
    const job = jest.fn();
    const anotherJob = jest.fn();
    await schedulerService.schedule(job, 50, 'test-id-6');
    await schedulerService.schedule(anotherJob, 50, 'test-id-7');
    await ms(75);
    expect(job).toBeCalledTimes(2);
    expect(anotherJob).toBeCalledTimes(2);
    schedulerService.stop();
});
test('Can schedule multiple jobs at the different intervals', async () => {
    const job = jest.fn();
    const anotherJob = jest.fn();
    await schedulerService.schedule(job, 100, 'test-id-8');
    await schedulerService.schedule(anotherJob, 200, 'test-id-9');
    await ms(250);
    expect(job).toBeCalledTimes(3);
    expect(anotherJob).toBeCalledTimes(2);
    schedulerService.stop();
});
test('Can handle crash of a async job', async () => {
    const job = async () => {
        await Promise.reject('async reason');
    };
    await schedulerService.schedule(job, 50, 'test-id-10');
    await ms(75);
    schedulerService.stop();
    const records = getRecords();
    expect(records[0][0]).toContain('initial scheduled job failed | id: test-id-10');
    expect(records[1][0]).toContain('interval scheduled job failed | id: test-id-10');
});
test('Can handle crash of a sync job', async () => {
    const job = () => {
        throw new Error('sync reason');
    };
    await schedulerService.schedule(job, 50, 'test-id-11');
    await ms(75);
    schedulerService.stop();
    const records = getRecords();
    expect(records[0][0]).toContain('initial scheduled job failed | id: test-id-11');
    expect(records[1][0]).toContain('interval scheduled job failed | id: test-id-11');
});
//# sourceMappingURL=scheduler-service.test.js.map