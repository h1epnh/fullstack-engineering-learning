"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../../lib/error/notfound-error"));
class FakeFeatureTypeStore {
    constructor() {
        this.featureTypes = [];
    }
    async delete(key) {
        this.featureTypes.splice(this.featureTypes.findIndex((type) => type.id === key), 1);
    }
    async deleteAll() {
        this.featureTypes = [];
    }
    destroy() { }
    async exists(key) {
        return this.featureTypes.some((fT) => fT.id === key);
    }
    async get(key) {
        const type = this.featureTypes.find((fT) => fT.id === key);
        if (type) {
            return type;
        }
        throw new notfound_error_1.default(`Could not find feature type with id : ${key}`);
    }
    async getAll() {
        return this.featureTypes;
    }
    async getByName(name) {
        const type = this.featureTypes.find((fT) => fT.name === name);
        if (type) {
            return type;
        }
        throw new notfound_error_1.default(`Could not find feature type with name: ${name}`);
    }
    async updateLifetime(name, newLifetimeDays) {
        const featureType = this.featureTypes.find(({ name: type }) => type === name);
        if (!featureType) {
            return undefined;
        }
        featureType.lifetimeDays = newLifetimeDays;
        return featureType;
    }
}
exports.default = FakeFeatureTypeStore;
//# sourceMappingURL=fake-feature-type-store.js.map