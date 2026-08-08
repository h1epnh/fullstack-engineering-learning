"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../error/notfound-error"));
const types_1 = require("../types");
class FeatureTypeService {
    constructor({ featureTypeStore }, { getLogger }, eventService) {
        this.featureTypeStore = featureTypeStore;
        this.logger = getLogger('services/feature-type-service.ts');
        this.eventService = eventService;
    }
    async getAll() {
        return this.featureTypeStore.getAll();
    }
    async updateLifetime(id, newLifetimeDays, auditUser) {
        // because our OpenAPI library does type coercion, any `null` values you
        // pass in get converted to `0`.
        const translatedLifetime = newLifetimeDays === 0 ? null : newLifetimeDays;
        const featureType = await this.featureTypeStore.get(id);
        const result = await this.featureTypeStore.updateLifetime(id, translatedLifetime);
        if (!featureType || !result) {
            throw new notfound_error_1.default(`The feature type you tried to update ("${id}") does not exist.`);
        }
        await this.eventService.storeEvent(new types_1.FeatureTypeUpdatedEvent({
            auditUser,
            data: { ...featureType, lifetimeDays: translatedLifetime },
            preData: featureType,
        }));
        return result;
    }
}
exports.default = FeatureTypeService;
module.exports = FeatureTypeService;
//# sourceMappingURL=feature-type-service.js.map