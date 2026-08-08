"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeApiTokenService = exports.createApiTokenService = void 0;
const environment_store_1 = __importDefault(require("../project-environments/environment-store"));
const services_1 = require("../../services");
const fake_environment_store_1 = __importDefault(require("../project-environments/fake-environment-store"));
const createEventsService_1 = require("../events/createEventsService");
const fake_api_token_store_1 = __importDefault(require("../../../test/fixtures/fake-api-token-store"));
const api_token_store_1 = require("../../db/api-token-store");
const createApiTokenService = (db, config) => {
    const { eventBus, getLogger } = config;
    const apiTokenStore = new api_token_store_1.ApiTokenStore(db, eventBus, getLogger, config.flagResolver);
    const environmentStore = new environment_store_1.default(db, eventBus, config);
    const eventService = (0, createEventsService_1.createEventsService)(db, config);
    return new services_1.ApiTokenService({ apiTokenStore, environmentStore }, config, eventService);
};
exports.createApiTokenService = createApiTokenService;
const createFakeApiTokenService = (config) => {
    const apiTokenStore = new fake_api_token_store_1.default();
    const environmentStore = new fake_environment_store_1.default();
    const eventService = (0, createEventsService_1.createFakeEventsService)(config);
    const apiTokenService = new services_1.ApiTokenService({ apiTokenStore, environmentStore }, config, eventService);
    return {
        apiTokenService,
        apiTokenStore,
        eventService,
        environmentStore,
    };
};
exports.createFakeApiTokenService = createFakeApiTokenService;
//# sourceMappingURL=createApiTokenService.js.map