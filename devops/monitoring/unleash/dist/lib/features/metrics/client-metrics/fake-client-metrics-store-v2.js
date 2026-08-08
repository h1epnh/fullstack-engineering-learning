"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable @typescript-eslint/no-unused-vars */
const events_1 = __importDefault(require("events"));
class FakeClientMetricsStoreV2 extends events_1.default {
    constructor() {
        super();
        this.metrics = [];
        this.setMaxListeners(0);
    }
    getFeatureFlagNames() {
        throw new Error('Method not implemented.');
    }
    getSeenTogglesForApp(appName, hoursBack) {
        throw new Error('Method not implemented.');
    }
    clearMetrics(hoursBack) {
        return Promise.resolve();
    }
    clearDailyMetrics(daysBack) {
        return Promise.resolve();
    }
    countPreviousDayHourlyMetricsBuckets() {
        return Promise.resolve({ enabledCount: 0, variantCount: 0 });
    }
    countPreviousDayMetricsBuckets() {
        return Promise.resolve({ enabledCount: 0, variantCount: 0 });
    }
    aggregateDailyMetrics() {
        return Promise.resolve();
    }
    getSeenAppsForFeatureToggle(featureName, hoursBack) {
        throw new Error('Method not implemented.');
    }
    getMetricsForFeatureToggle(featureName, hoursBack) {
        throw new Error('Method not implemented.');
    }
    getMetricsForFeatureToggleV2(featureName, hoursBack) {
        throw new Error('Method not implemented.');
    }
    batchInsertMetrics(metrics) {
        metrics.forEach((m) => this.metrics.push(m));
        return Promise.resolve();
    }
    get(key) {
        throw new Error('Method not implemented.');
    }
    getAll(query) {
        throw new Error('Method not implemented.');
    }
    exists(key) {
        throw new Error('Method not implemented.');
    }
    delete(key) {
        throw new Error('Method not implemented.');
    }
    async getMetricsLastHour() {
        return Promise.resolve([]);
    }
    async insert() {
        return Promise.resolve();
    }
    async deleteAll() {
        return Promise.resolve(undefined);
    }
    destroy() { }
}
exports.default = FakeClientMetricsStoreV2;
//# sourceMappingURL=fake-client-metrics-store-v2.js.map