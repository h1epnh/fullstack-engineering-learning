"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../../lib/error/notfound-error"));
class FakeClientApplicationsStore {
    constructor() {
        this.apps = [];
    }
    async bulkUpsert(details) {
        // @ts-expect-error
        details.forEach((d) => this.apps.push(d));
    }
    async delete(key) {
        this.apps.splice(this.apps.findIndex((a) => a.appName === key), 1);
    }
    async deleteAll() {
        this.apps = [];
    }
    async deleteApplication(appName) {
        return this.delete(appName);
    }
    destroy() { }
    async exists(key) {
        return this.apps.some((a) => a.appName === key);
    }
    async get(key) {
        const app = this.apps.find((a) => a.appName === key);
        if (app) {
            return app;
        }
        throw new notfound_error_1.default(`Could not find application with appName: ${key}`);
    }
    async getAll() {
        return this.apps;
    }
    async getApplication(appName) {
        return this.get(appName);
    }
    async getApplications(query) {
        return {
            applications: this.apps,
            total: this.apps.length,
        };
    }
    async getUnannounced() {
        return this.apps.filter((a) => !a.announced);
    }
    async setUnannouncedToAnnounced() {
        this.apps = this.apps.map((a) => ({ ...a, announced: true }));
        return this.apps;
    }
    async upsert(details) {
        await this.delete(details.appName);
        return this.bulkUpsert([details]);
    }
    getApplicationOverview(appName) {
        throw new Error('Method not implemented.');
    }
}
exports.default = FakeClientApplicationsStore;
//# sourceMappingURL=fake-client-applications-store.js.map