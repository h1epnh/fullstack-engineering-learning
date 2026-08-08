"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../../lib/error/notfound-error"));
const lodash_groupby_1 = __importDefault(require("lodash.groupby"));
class FakeClientInstanceStore {
    constructor() {
        this.instances = [];
    }
    async bulkUpsert(instances) {
        instances.forEach((i) => {
            this.instances.push({ createdAt: new Date(), ...i });
        });
    }
    async delete(key) {
        this.instances.splice(this.instances.findIndex((i) => i.instanceId === key.instanceId &&
            i.appName === key.appName), 1);
    }
    setLastSeen() {
        return Promise.resolve();
    }
    async getBySdkName(sdkName) {
        return this.instances.filter((instance) => instance.sdkVersion?.startsWith(sdkName));
    }
    async groupApplicationsBySdk() {
        return Object.entries((0, lodash_groupby_1.default)(this.instances, 'sdkVersion')).map(([sdkVersion, apps]) => ({
            sdkVersion,
            applications: apps.map((item) => item.appName),
        }));
    }
    async groupApplicationsBySdkAndProject(projectId) {
        throw new Error('Not implemented in mock');
    }
    async deleteAll() {
        this.instances = [];
    }
    async deleteForApplication(appName) {
        this.instances = this.instances.filter((i) => i.appName !== appName);
    }
    destroy() { }
    async exists(key) {
        return this.instances.some((i) => i.appName === key.appName && i.instanceId === key.instanceId);
    }
    async get(key) {
        const instance = this.instances.find((i) => i.appName === key.appName && i.instanceId === key.instanceId);
        if (instance) {
            return instance;
        }
        throw new notfound_error_1.default(`Could not find instance with key: ${key}`);
    }
    async getAll() {
        return this.instances;
    }
    async getByAppName(appName) {
        return this.instances.filter((i) => i.appName === appName);
    }
    async getRecentByAppNameAndEnvironment(appName, environment) {
        return this.instances
            .filter((i) => i.appName === appName)
            .filter((i) => i.environment === environment);
    }
    async getDistinctApplications() {
        const apps = new Set();
        this.instances.forEach((i) => apps.add(i.appName));
        return Array.from(apps.values());
    }
    async getDistinctApplicationsCount() {
        const apps = await this.getDistinctApplications();
        return apps.length;
    }
    async insert(details) {
        this.instances.push({ createdAt: new Date(), ...details });
    }
    removeInstancesOlderThanTwoDays() {
        return Promise.resolve(undefined);
    }
}
exports.default = FakeClientInstanceStore;
//# sourceMappingURL=fake-client-instance-store.js.map