"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const scheduler_service_1 = require("../scheduler/scheduler-service");
const maintenance_service_1 = __importDefault(require("./maintenance-service"));
const setting_service_1 = __importDefault(require("../../services/setting-service"));
const test_config_1 = require("../../../test/config/test-config");
const fake_setting_store_1 = __importDefault(require("../../../test/fixtures/fake-setting-store"));
const types_1 = require("../../types");
test('Scheduler should run scheduled functions if maintenance mode is off', async () => {
    const config = (0, test_config_1.createTestConfig)();
    const settingStore = new fake_setting_store_1.default();
    const settingService = new setting_service_1.default({ settingStore }, config, {
        storeEvent() { },
    });
    const maintenanceService = new maintenance_service_1.default(config, settingService);
    const schedulerService = new scheduler_service_1.SchedulerService(config.getLogger, maintenanceService, config.eventBus);
    const job = jest.fn();
    await schedulerService.schedule(job, 10, 'test-id');
    expect(job).toBeCalledTimes(1);
    schedulerService.stop();
});
test('Scheduler should not run scheduled functions if maintenance mode is on', async () => {
    const config = (0, test_config_1.createTestConfig)();
    const settingStore = new fake_setting_store_1.default();
    const settingService = new setting_service_1.default({ settingStore }, config, {
        storeEvent() { },
    });
    const maintenanceService = new maintenance_service_1.default(config, settingService);
    const schedulerService = new scheduler_service_1.SchedulerService(config.getLogger, maintenanceService, config.eventBus);
    await maintenanceService.toggleMaintenanceMode({ enabled: true }, types_1.TEST_AUDIT_USER);
    const job = jest.fn();
    await schedulerService.schedule(job, 10, 'test-id');
    expect(job).toBeCalledTimes(0);
    schedulerService.stop();
});
//# sourceMappingURL=maintenance-service.test.js.map