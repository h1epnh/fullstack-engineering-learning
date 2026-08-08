"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../../error/notfound-error"));
class FakeContextFieldStore {
    constructor() {
        this.defaultContextFields = [
            {
                name: 'environment',
                createdAt: new Date(),
                description: 'Environment',
                sortOrder: 0,
                stickiness: true,
            },
            {
                name: 'userId',
                createdAt: new Date(),
                description: 'Environment',
                sortOrder: 0,
                stickiness: true,
            },
            {
                name: 'appName',
                createdAt: new Date(),
                description: 'Environment',
                sortOrder: 0,
                stickiness: true,
            },
        ];
        this.contextFields = this.defaultContextFields;
    }
    count() {
        return Promise.resolve(0);
    }
    async create(data) {
        const cF = { createdAt: new Date(), ...data };
        this.contextFields.push(cF);
        return cF;
    }
    async delete(key) {
        this.contextFields.splice(this.contextFields.findIndex((cF) => cF.name === key), 1);
    }
    async deleteAll() {
        this.contextFields = this.defaultContextFields;
    }
    destroy() { }
    async exists(key) {
        return this.contextFields.some((cF) => cF.name === key);
    }
    async get(key) {
        const contextField = this.contextFields.find((cF) => cF.name === key);
        if (contextField) {
            return contextField;
        }
        throw new notfound_error_1.default(`Could not find contextField with name : ${key}`);
    }
    async getAll() {
        return this.contextFields;
    }
    async update(data) {
        await this.delete(data.name);
        return this.create(data);
    }
}
exports.default = FakeContextFieldStore;
//# sourceMappingURL=fake-context-field-store.js.map