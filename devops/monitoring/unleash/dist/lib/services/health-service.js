"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HealthService {
    constructor({ featureTypeStore }, { getLogger }) {
        this.featureTypeStore = featureTypeStore;
        this.logger = getLogger('services/health-service.ts');
    }
    async dbIsUp() {
        const row = await this.featureTypeStore.getAll();
        return row.length > 0;
    }
}
exports.default = HealthService;
module.exports = HealthService;
//# sourceMappingURL=health-service.js.map