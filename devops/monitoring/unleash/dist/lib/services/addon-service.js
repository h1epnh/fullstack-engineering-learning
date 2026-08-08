"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const memoizee_1 = __importDefault(require("memoizee"));
const joi_1 = require("joi");
const addons_1 = require("../addons");
const events = __importStar(require("../types/events"));
const events_1 = require("../types/events");
const addon_schema_1 = require("./addon-schema");
const name_exists_error_1 = __importDefault(require("../error/name-exists-error"));
const types_1 = require("../types");
const date_fns_1 = require("date-fns");
const util_1 = require("../util");
const error_1 = require("../error");
const SUPPORTED_EVENTS = Object.keys(events).map((k) => events[k]);
const MASKED_VALUE = '*****';
const WILDCARD_OPTION = '*';
class AddonService {
    constructor({ addonStore, featureToggleStore, }, { getLogger, server, flagResolver, eventBus, }, tagTypeService, eventService, integrationEventsService, addons) {
        this.addonStore = addonStore;
        this.featureToggleStore = featureToggleStore;
        this.logger = getLogger('services/addon-service.js');
        this.tagTypeService = tagTypeService;
        this.eventService = eventService;
        this.addonProviders =
            addons ||
                (0, addons_1.getAddons)({
                    getLogger,
                    unleashUrl: server.unleashUrl,
                    integrationEventsService,
                    flagResolver,
                    eventBus,
                });
        this.sensitiveParams = this.loadSensitiveParams(this.addonProviders);
        if (addonStore) {
            this.registerEventHandler();
        }
        // Memoized private function
        this.fetchAddonConfigs = (0, memoizee_1.default)(async () => addonStore.getAll({ enabled: true }), {
            promise: true,
            maxAge: (0, date_fns_1.minutesToMilliseconds)(1),
        });
    }
    loadSensitiveParams(addonProviders) {
        const providerDefinitions = Object.values(addonProviders).map((p) => p.definition);
        return providerDefinitions.reduce((obj, definition) => {
            const sensitiveParams = definition.parameters
                ?.filter((p) => p.sensitive)
                .map((p) => p.name);
            const o = { ...obj };
            o[definition.name] = sensitiveParams;
            return o;
        }, {});
    }
    registerEventHandler() {
        SUPPORTED_EVENTS.forEach((eventName) => this.eventService.onEvent(eventName, this.handleEvent(eventName)));
    }
    handleEvent(eventName) {
        const { addonProviders } = this;
        return (event) => {
            this.fetchAddonConfigs().then((addonInstances) => {
                addonInstances
                    .filter((addon) => addon.events.includes(eventName))
                    .filter((addon) => !event.project ||
                    !addon.projects ||
                    addon.projects.length === 0 ||
                    addon.projects[0] === WILDCARD_OPTION ||
                    addon.projects.includes(event.project))
                    .filter((addon) => !event.environment ||
                    !addon.environments ||
                    addon.environments.length === 0 ||
                    addon.environments[0] === WILDCARD_OPTION ||
                    addon.environments.includes(event.environment))
                    .filter((addon) => addonProviders[addon.provider])
                    .forEach((addon) => addonProviders[addon.provider].handleEvent(event, addon.parameters, addon.id));
            });
        };
    }
    // Should be used by the controller.
    async getAddons() {
        const addonConfigs = await this.addonStore.getAll();
        return addonConfigs.map((a) => this.filterSensitiveFields(a));
    }
    filterSensitiveFields(addonConfig) {
        const { sensitiveParams } = this;
        const a = { ...addonConfig };
        a.parameters = Object.keys(a.parameters).reduce((obj, paramKey) => {
            const o = { ...obj };
            if (sensitiveParams[a.provider].includes(paramKey)) {
                o[paramKey] = MASKED_VALUE;
            }
            else {
                o[paramKey] = a.parameters[paramKey];
            }
            return o;
        }, {});
        return a;
    }
    async getAddon(id) {
        const addonConfig = await this.addonStore.get(id);
        if (addonConfig === undefined) {
            throw new error_1.NotFoundError();
        }
        return this.filterSensitiveFields(addonConfig);
    }
    getProviderDefinitions() {
        const { addonProviders } = this;
        return Object.values(addonProviders).map((p) => p.definition);
    }
    async addTagTypes(providerName) {
        const provider = this.addonProviders[providerName];
        if (provider) {
            const tagTypes = provider.definition.tagTypes || [];
            const createTags = tagTypes.map(async (tagType) => {
                try {
                    await this.tagTypeService.validateUnique(tagType.name);
                    await this.tagTypeService.createTagType(tagType, types_1.SYSTEM_USER_AUDIT);
                }
                catch (err) {
                    if (!(err instanceof name_exists_error_1.default)) {
                        this.logger.error(err);
                    }
                }
            });
            await Promise.all(createTags);
        }
        return Promise.resolve();
    }
    async createAddon(data, auditUser) {
        const addonConfig = await addon_schema_1.addonSchema.validateAsync(data);
        await this.validateKnownProvider(addonConfig);
        await this.validateRequiredParameters(addonConfig);
        const createdAddon = await this.addonStore.insert(addonConfig);
        await this.addTagTypes(createdAddon.provider);
        this.logger.info(`User ${auditUser.username} created addon ${addonConfig.provider}`);
        await this.eventService.storeEvent(new events_1.AddonConfigCreatedEvent({
            data: (0, util_1.omitKeys)(createdAddon, 'parameters'),
            auditUser,
        }));
        return createdAddon;
    }
    async updateAddon(id, data, auditUser) {
        const existingConfig = await this.addonStore.get(id);
        if (existingConfig === undefined) {
            throw new error_1.NotFoundError();
        } // because getting an early 404 here makes more sense
        const addonConfig = await addon_schema_1.addonSchema.validateAsync(data);
        await this.validateKnownProvider(addonConfig);
        await this.validateRequiredParameters(addonConfig);
        if (this.sensitiveParams[addonConfig.provider].length > 0) {
            addonConfig.parameters = Object.keys(addonConfig.parameters).reduce((params, key) => {
                const o = { ...params };
                if (addonConfig.parameters[key] === MASKED_VALUE) {
                    o[key] = existingConfig.parameters[key];
                }
                else {
                    o[key] = addonConfig.parameters[key];
                }
                return o;
            }, {});
        }
        const result = await this.addonStore.update(id, addonConfig);
        await this.eventService.storeEvent(new events_1.AddonConfigUpdatedEvent({
            preData: (0, util_1.omitKeys)(existingConfig, 'parameters'),
            data: (0, util_1.omitKeys)(result, 'parameters'),
            auditUser,
        }));
        this.logger.info(`User ${auditUser} updated addon ${id}`);
        return result;
    }
    async removeAddon(id, auditUser) {
        const existingConfig = await this.addonStore.get(id);
        if (existingConfig === undefined) {
            /// No config, no need to delete
            return;
        }
        await this.addonStore.delete(id);
        await this.eventService.storeEvent(new events_1.AddonConfigDeletedEvent({
            preData: (0, util_1.omitKeys)(existingConfig, 'parameters'),
            auditUser,
        }));
        this.logger.info(`User ${auditUser} removed addon ${id}`);
    }
    async validateKnownProvider(config) {
        if (!config.provider) {
            throw new joi_1.ValidationError('No addon provider supplied. The property was either missing or an empty value.', [], undefined);
        }
        const p = this.addonProviders[config.provider];
        if (!p) {
            throw new joi_1.ValidationError(`Unknown addon provider ${config.provider}`, [], undefined);
        }
        else {
            return true;
        }
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async validateRequiredParameters({ provider, parameters, }) {
        const providerDefinition = this.addonProviders[provider].definition;
        const requiredParamsMissing = providerDefinition.parameters
            ?.filter((p) => p.required)
            .map((p) => p.name)
            .filter((requiredParam) => !Object.keys(parameters).includes(requiredParam)) || [];
        if (requiredParamsMissing.length > 0) {
            throw new joi_1.ValidationError(`Missing required parameters: ${requiredParamsMissing.join(',')} `, [], undefined);
        }
        return true;
    }
    destroy() {
        Object.values(this.addonProviders).forEach((addon) => addon.destroy?.());
    }
}
exports.default = AddonService;
//# sourceMappingURL=addon-service.js.map