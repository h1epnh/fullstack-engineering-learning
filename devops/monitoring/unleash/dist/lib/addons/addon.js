"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const make_fetch_happen_1 = __importDefault(require("make-fetch-happen"));
const addon_schema_1 = require("./addon-schema");
const metric_events_1 = require("../metric-events");
class Addon {
    constructor(definition, { getLogger, integrationEventsService, flagResolver, eventBus, }) {
        this.logger = getLogger(`addon/${definition.name}`);
        const { error } = addon_schema_1.addonDefinitionSchema.validate(definition);
        if (error) {
            this.logger.warn(`Could not load addon provider ${definition.name}`, error);
            throw error;
        }
        this._name = definition.name;
        this._definition = definition;
        this.integrationEventsService = integrationEventsService;
        this.eventBus = eventBus;
        this.flagResolver = flagResolver;
    }
    get name() {
        return this._name;
    }
    get definition() {
        return this._definition;
    }
    async fetchRetry(url, options = {}, retries = 1) {
        // biome-ignore lint/suspicious/noImplicitAnyLet: Due to calling upstream, it's not easy knowing the real type here
        let res;
        try {
            res = await (0, make_fetch_happen_1.default)(url, {
                retry: {
                    retries,
                },
                ...options,
            });
            return res;
        }
        catch (e) {
            const { method } = options;
            this.logger.warn(`Error querying ${url} with method ${method || 'GET'} status code ${e.code}`, e);
            res = { status: e.code, ok: false };
        }
        return res;
    }
    async registerEvent(integrationEvent) {
        await this.integrationEventsService.registerEvent(integrationEvent);
        this.eventBus.emit(metric_events_1.ADDON_EVENTS_HANDLED, {
            result: integrationEvent.state,
            destination: this.name,
        });
    }
}
exports.default = Addon;
//# sourceMappingURL=addon.js.map