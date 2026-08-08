"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const scheduler_service_1 = require("./scheduler-service");
const maintenance_service_1 = __importDefault(require("../maintenance/maintenance-service"));
const test_config_1 = require("../../../test/config/test-config");
const setting_service_1 = __importDefault(require("../../services/setting-service"));
const fake_setting_store_1 = __importDefault(require("../../../test/fixtures/fake-setting-store"));
const metric_events_1 = require("../../metric-events");
const events_1 = __importDefault(require("events"));
const types_1 = require("../../types");
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
    const getRecords = () => records;
    return { logger, getRecords };
};
const toggleMaintenanceMode = async (maintenanceService, enabled) => {
    await maintenanceService.toggleMaintenanceMode({ enabled }, types_1.TEST_AUDIT_USER);
};
const createSchedulerTestService = ({ loggerOverride, eventBusOverride, } = {}) => {
    const config = {
        ...(0, test_config_1.createTestConfig)(),
        eventBus: eventBusOverride || new events_1.default(),
    };
    const logger = loggerOverride || config.getLogger;
    const settingStore = new fake_setting_store_1.default();
    const settingService = new setting_service_1.default({ settingStore }, config, {
        storeEvent() { },
    });
    const maintenanceService = new maintenance_service_1.default(config, settingService);
    const schedulerService = new scheduler_service_1.SchedulerService(logger, maintenanceService, config.eventBus);
    return { schedulerService, maintenanceService };
};
test('Schedules job immediately', async () => {
    const { schedulerService } = createSchedulerTestService();
    const NO_JITTER = 0;
    const job = jest.fn();
    await schedulerService.schedule(job, 10, 'test-id', NO_JITTER);
    expect(job).toBeCalledTimes(1);
    schedulerService.stop();
});
test('Does not schedule job immediately when paused', async () => {
    const { schedulerService, maintenanceService } = createSchedulerTestService();
    const job = jest.fn();
    await toggleMaintenanceMode(maintenanceService, true);
    await schedulerService.schedule(job, 10, 'test-id-2');
    expect(job).toBeCalledTimes(0);
    schedulerService.stop();
});
test('Can schedule a single regular job', async () => {
    const { schedulerService } = createSchedulerTestService();
    const job = jest.fn();
    await schedulerService.schedule(job, 50, 'test-id-3');
    await ms(75);
    expect(job).toBeCalledTimes(2);
    schedulerService.stop();
});
test('Scheduled job ignored in a paused mode', async () => {
    const { schedulerService, maintenanceService } = createSchedulerTestService();
    const job = jest.fn();
    await toggleMaintenanceMode(maintenanceService, true);
    await schedulerService.schedule(job, 50, 'test-id-4');
    await ms(75);
    expect(job).toBeCalledTimes(0);
    schedulerService.stop();
});
test('Can resume paused job', async () => {
    const { schedulerService, maintenanceService } = createSchedulerTestService();
    const job = jest.fn();
    await toggleMaintenanceMode(maintenanceService, true);
    await schedulerService.schedule(job, 50, 'test-id-5');
    await toggleMaintenanceMode(maintenanceService, false);
    await ms(75);
    expect(job).toBeCalledTimes(1);
    schedulerService.stop();
});
test('Can schedule multiple jobs at the same interval', async () => {
    const { schedulerService } = createSchedulerTestService();
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
    const { schedulerService } = createSchedulerTestService();
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
    const { logger, getRecords } = getLogger();
    const { schedulerService } = createSchedulerTestService({
        loggerOverride: logger,
    });
    const job = async () => {
        await Promise.reject('async reason');
    };
    await schedulerService.schedule(job, 50, 'test-id-10', 0);
    await ms(75);
    schedulerService.stop();
    const records = getRecords();
    expect(records[0][0]).toContain('initial scheduled job failed | id: test-id-10');
    expect(records[0][1]).toContain('async reason');
    expect(records[1][0]).toContain('interval scheduled job failed | id: test-id-10');
    expect(records[1][1]).toContain('async reason');
});
test('Can handle crash of a sync job', async () => {
    const { logger, getRecords } = getLogger();
    const { schedulerService } = createSchedulerTestService({
        loggerOverride: logger,
    });
    const job = () => {
        throw new Error('sync reason');
    };
    await schedulerService.schedule(job, 50, 'test-id-11');
    await ms(75);
    schedulerService.stop();
    const records = getRecords();
    expect(records[0][0]).toContain('initial scheduled job failed | id: test-id-11');
    expect(records[0][1].message).toContain('sync reason');
    expect(records[1][0]).toContain('interval scheduled job failed | id: test-id-11');
});
it('should emit scheduler job time event when scheduled function is run', async () => {
    const eventBus = new events_1.default();
    const { schedulerService } = createSchedulerTestService({
        eventBusOverride: eventBus,
    });
    const mockJob = async () => {
        return Promise.resolve();
    };
    const eventPromise = new Promise((resolve, reject) => {
        eventBus.on(metric_events_1.SCHEDULER_JOB_TIME, ({ jobId, time }) => {
            try {
                expect(jobId).toBe('testJobId');
                expect(typeof time).toBe('number');
                resolve(null);
            }
            catch (e) {
                reject(e);
            }
        });
    });
    await schedulerService.schedule(mockJob, 50, 'testJobId');
    await eventPromise;
});
test('Delays initial job execution by jitter duration', async () => {
    const { schedulerService } = createSchedulerTestService();
    const job = jest.fn();
    const jitterMs = 10;
    await schedulerService.schedule(job, 10000, 'test-id', jitterMs);
    expect(job).toBeCalledTimes(0);
    await ms(50);
    expect(job).toBeCalledTimes(1);
    schedulerService.stop();
});
test('Does not apply jitter if schedule interval is smaller than max jitter', async () => {
    const { schedulerService } = createSchedulerTestService();
    const job = jest.fn();
    // default jitter 2s-30s
    await schedulerService.schedule(job, 1000, 'test-id');
    expect(job).toBeCalledTimes(1);
    schedulerService.stop();
});
test('Does not allow to run scheduled job when it is already pending', async () => {
    const { schedulerService } = createSchedulerTestService();
    const NO_JITTER = 0;
    const job = jest.fn();
    const slowJob = async () => {
        job();
        await ms(25);
    };
    void schedulerService.schedule(slowJob, 10, 'test-id', NO_JITTER);
    // scheduler had 2 chances to run but the initial slowJob was pending
    await ms(25);
    expect(job).toBeCalledTimes(1);
    schedulerService.stop();
});
//# sourceMappingURL=scheduler-service.test.js.map