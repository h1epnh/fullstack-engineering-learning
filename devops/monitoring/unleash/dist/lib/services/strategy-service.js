"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../error/notfound-error"));
const types_1 = require("../types");
const strategy_schema_1 = __importDefault(require("./strategy-schema"));
const error_1 = require("../error");
class StrategyService {
    constructor({ strategyStore }, { getLogger }, eventService) {
        this.strategyStore = strategyStore;
        this.eventService = eventService;
        this.logger = getLogger('services/strategy-service.js');
    }
    async getStrategies() {
        return this.strategyStore.getAll();
    }
    async getStrategy(name) {
        return this.strategyStore.get(name);
    }
    async removeStrategy(strategyName, auditUser) {
        const strategy = await this.strategyStore.get(strategyName);
        await this._validateEditable(strategy);
        await this.strategyStore.delete(strategyName);
        await this.eventService.storeEvent(new types_1.StrategyDeletedEvent({
            data: {
                name: strategyName,
            },
            auditUser,
        }));
    }
    async deprecateStrategy(strategyName, auditUser) {
        if (await this.strategyStore.exists(strategyName)) {
            // Check existence
            await this.strategyStore.deprecateStrategy({ name: strategyName });
            await this.eventService.storeEvent(new types_1.StrategyDeprecatedEvent({
                data: {
                    name: strategyName,
                },
                auditUser,
            }));
        }
        else {
            throw new notfound_error_1.default(`Could not find strategy with name ${strategyName}`);
        }
    }
    async reactivateStrategy(strategyName, auditUser) {
        await this.strategyStore.get(strategyName); // Check existence
        await this.strategyStore.reactivateStrategy({ name: strategyName });
        await this.eventService.storeEvent(new types_1.StrategyReactivatedEvent({
            data: {
                name: strategyName,
            },
            auditUser,
        }));
    }
    async createStrategy(value, auditUser) {
        const strategy = await strategy_schema_1.default.validateAsync(value);
        strategy.deprecated = false;
        await this._validateStrategyName(strategy);
        await this.strategyStore.createStrategy(strategy);
        await this.eventService.storeEvent(new types_1.StrategyCreatedEvent({
            data: strategy,
            auditUser,
        }));
        return this.strategyStore.get(strategy.name);
    }
    async updateStrategy(input, auditUser) {
        const value = await strategy_schema_1.default.validateAsync(input);
        const strategy = await this.strategyStore.get(input.name);
        await this._validateEditable(strategy);
        await this.strategyStore.updateStrategy(value);
        await this.eventService.storeEvent(new types_1.StrategyUpdatedEvent({
            data: value,
            auditUser,
        }));
    }
    _validateStrategyName(data) {
        return new Promise((resolve, reject) => {
            this.strategyStore
                .get(data.name)
                .then(() => reject(new error_1.NameExistsError(`Strategy with name ${data.name} already exist!`)))
                .catch(() => resolve(data));
        });
    }
    // This check belongs in the store.
    _validateEditable(strategy) {
        if (!strategy?.editable) {
            throw new Error(`Cannot edit strategy ${strategy?.name}`);
        }
    }
}
exports.default = StrategyService;
module.exports = StrategyService;
//# sourceMappingURL=strategy-service.js.map