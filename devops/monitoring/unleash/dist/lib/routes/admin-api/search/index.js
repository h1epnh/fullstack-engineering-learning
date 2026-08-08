"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchApi = void 0;
const event_search_controller_1 = __importDefault(require("../../../features/events/event-search-controller"));
const feature_search_controller_1 = __importDefault(require("../../../features/feature-search/feature-search-controller"));
const controller_1 = __importDefault(require("../../controller"));
class SearchApi extends controller_1.default {
    constructor(config, services, db) {
        super(config);
        this.app.use('/features', new feature_search_controller_1.default(config, services).router);
        this.app.use('/events', new event_search_controller_1.default(config, services).router);
    }
}
exports.SearchApi = SearchApi;
//# sourceMappingURL=index.js.map