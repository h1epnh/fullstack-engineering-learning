"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unused-vars */
class FakeProjectStatsStore {
    constructor() {
        this.stats = {};
    }
    async updateProjectStats(projectId, stats) {
        this.stats[projectId] = stats;
    }
    async getProjectStats(projectId) {
        return this.stats[projectId];
    }
    async getTimeToProdDates() {
        return [];
    }
    async getTimeToProdDatesForFeatureToggles() {
        return [];
    }
}
exports.default = FakeProjectStatsStore;
//# sourceMappingURL=fake-project-stats-store.js.map