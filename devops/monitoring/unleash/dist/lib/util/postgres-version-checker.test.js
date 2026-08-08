"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_config_1 = require("../../test/config/test-config");
const postgres_version_checker_1 = require("./postgres-version-checker");
const fake_setting_store_1 = __importDefault(require("../../test/fixtures/fake-setting-store"));
let config;
let settingStore;
let infoMessages;
let errorMessages;
const fakeSettingStore = (postgresVersion) => {
    const temp = new fake_setting_store_1.default();
    jest.spyOn(temp, 'postgresVersion').mockResolvedValue(postgresVersion);
    return temp;
};
beforeEach(() => {
    infoMessages = [];
    errorMessages = [];
    config = (0, test_config_1.createTestConfig)({
        getLogger: () => {
            return {
                info: (message) => {
                    infoMessages.push(message);
                },
                error: (message) => {
                    errorMessages.push(message);
                },
                warn: (message) => { },
                debug: (message) => { },
                fatal(message, ...args) { },
            };
        },
    });
});
describe('postgres-version-checker', () => {
    describe('Postgres version below 13.0 will yield error messages', () => {
        test('12.1.7', async () => {
            settingStore = fakeSettingStore('12.1.7');
            await (0, postgres_version_checker_1.compareAndLogPostgresVersion)(config, settingStore);
            expect(errorMessages).toHaveLength(1);
            expect(infoMessages).toHaveLength(0);
        });
        test('12.1', async () => {
            settingStore = fakeSettingStore('12.1');
            await (0, postgres_version_checker_1.compareAndLogPostgresVersion)(config, settingStore);
            expect(errorMessages).toHaveLength(1);
            expect(infoMessages).toHaveLength(0);
        });
        test('11.1', async () => {
            settingStore = fakeSettingStore('11.1');
            await (0, postgres_version_checker_1.compareAndLogPostgresVersion)(config, settingStore);
            expect(errorMessages).toHaveLength(1);
            expect(infoMessages).toHaveLength(0);
        });
        test('10.1', async () => {
            settingStore = fakeSettingStore('10.1');
            await (0, postgres_version_checker_1.compareAndLogPostgresVersion)(config, settingStore);
            expect(errorMessages).toHaveLength(1);
            expect(infoMessages).toHaveLength(0);
        });
        test('9.6', async () => {
            settingStore = fakeSettingStore('9.6');
            await (0, postgres_version_checker_1.compareAndLogPostgresVersion)(config, settingStore);
            expect(errorMessages).toHaveLength(1);
            expect(infoMessages).toHaveLength(0);
        });
    });
    describe('Postgres version at 13.0 or higher will yield an info message', () => {
        test('13.9.2', async () => {
            settingStore = fakeSettingStore('13.9.2');
            await (0, postgres_version_checker_1.compareAndLogPostgresVersion)(config, settingStore);
            expect(errorMessages).toHaveLength(0);
            expect(infoMessages).toHaveLength(1);
        });
        test('14.9', async () => {
            settingStore = fakeSettingStore('14.9');
            await (0, postgres_version_checker_1.compareAndLogPostgresVersion)(config, settingStore);
            expect(errorMessages).toHaveLength(0);
            expect(infoMessages).toHaveLength(1);
        });
        test('15.9', async () => {
            settingStore = fakeSettingStore('15.9');
            await (0, postgres_version_checker_1.compareAndLogPostgresVersion)(config, settingStore);
            expect(errorMessages).toHaveLength(0);
            expect(infoMessages).toHaveLength(1);
        });
        test('16.2', async () => {
            settingStore = fakeSettingStore('16.2');
            await (0, postgres_version_checker_1.compareAndLogPostgresVersion)(config, settingStore);
            expect(errorMessages).toHaveLength(0);
            expect(infoMessages).toHaveLength(1);
        });
    });
});
//# sourceMappingURL=postgres-version-checker.test.js.map