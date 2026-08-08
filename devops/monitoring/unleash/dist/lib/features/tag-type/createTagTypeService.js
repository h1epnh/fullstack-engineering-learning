"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFakeTagTypeService = exports.createTagTypeService = void 0;
const tag_type_service_1 = __importDefault(require("./tag-type-service"));
const tag_type_store_1 = __importDefault(require("./tag-type-store"));
const fake_tag_type_store_1 = __importDefault(require("./fake-tag-type-store"));
const createEventsService_1 = require("../events/createEventsService");
const createTagTypeService = (config) => (db) => {
    const { getLogger, eventBus } = config;
    const eventService = (0, createEventsService_1.createEventsService)(db, config);
    const tagTypeStore = new tag_type_store_1.default(db, eventBus, getLogger);
    return new tag_type_service_1.default({ tagTypeStore }, config, eventService);
};
exports.createTagTypeService = createTagTypeService;
const createFakeTagTypeService = (config) => {
    const eventService = (0, createEventsService_1.createFakeEventsService)(config);
    const tagTypeStore = new fake_tag_type_store_1.default();
    return new tag_type_service_1.default({ tagTypeStore }, config, eventService);
};
exports.createFakeTagTypeService = createFakeTagTypeService;
//# sourceMappingURL=createTagTypeService.js.map