"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../../lib/error/notfound-error"));
class FakeStrategiesStore {
    constructor() {
        this.defaultStrategy = {
            name: 'default',
            description: 'default strategy',
            displayName: 'Default',
            editable: false,
            parameters: [],
            deprecated: false,
        };
        this.strategies = [this.defaultStrategy];
    }
    count() {
        return Promise.resolve(0);
    }
    async createStrategy(update) {
        let params;
        if (typeof update.parameters === 'string' ||
            typeof update.parameters === 'number') {
            if (update.parameters === '') {
                params = [];
            }
            else {
                params = JSON.parse(update.parameters);
            }
        }
        else {
            params = update.parameters;
        }
        this.strategies.push({
            editable: true,
            deprecated: false,
            description: '',
            displayName: update.name,
            ...update,
            parameters: params,
        });
    }
    async delete(key) {
        this.strategies.splice(this.strategies.findIndex((k) => k.name === key), 1);
    }
    async deleteAll() {
        this.strategies = [this.defaultStrategy];
    }
    async deleteStrategy({ name }) {
        return this.delete(name);
    }
    async deprecateStrategy({ name }) {
        const strategy = await this.get(name);
        strategy.deprecated = true;
    }
    destroy() { }
    async exists(key) {
        return this.strategies.some((s) => s.name === key && !s.deprecated);
    }
    async get(key) {
        const strat = this.strategies.find((s) => s.name === key);
        if (strat) {
            return strat;
        }
        throw new notfound_error_1.default(`Could not find strategy with name: ${key}`);
    }
    async getAll() {
        return this.strategies.filter((s) => !s.deprecated);
    }
    async getEditableStrategies() {
        return this.strategies
            .filter((s) => s.editable)
            .map((s) => {
            if (!s.parameters) {
                // eslint-disable-next-line no-param-reassign
                s.parameters = [];
            }
            return s;
        });
    }
    async getStrategy(name) {
        const strat = this.get(name);
        if (strat) {
            return strat;
        }
        throw new notfound_error_1.default(`Could not find strategy with name: ${name}`);
    }
    async importStrategy(data) {
        return this.createStrategy(data);
    }
    async reactivateStrategy({ name }) {
        const strategy = await this.get(name);
        strategy.deprecated = false;
        await this.delete(name);
        this.strategies.push(strategy);
    }
    async updateStrategy(update) {
        await this.delete(update.name);
        return this.createStrategy(update);
    }
    async dropCustomStrategies() {
        return this.deleteAll();
    }
}
exports.default = FakeStrategiesStore;
//# sourceMappingURL=fake-strategies-store.js.map