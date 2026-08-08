"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addon_1 = __importDefault(require("../addons/addon"));
const no_logger_1 = __importDefault(require("../../test/fixtures/no-logger"));
const events_1 = require("../types/events");
const ARGS = {
    getLogger: no_logger_1.default,
    unleashUrl: 'http://some-url.com',
    integrationEventsService: {},
    flagResolver: {},
    eventBus: {},
};
const definition = {
    name: 'simple',
    displayName: 'Simple ADdon',
    description: 'Some description',
    parameters: [
        {
            name: 'url',
            displayName: 'Some URL',
            type: 'url',
            required: true,
            sensitive: false,
        },
        {
            name: 'var',
            displayName: 'Some var',
            description: 'Some variable to inject',
            type: 'text',
            required: false,
            sensitive: false,
        },
        {
            name: 'sensitiveParam',
            displayName: 'Some sensitive param',
            description: 'Some variable to inject',
            type: 'text',
            required: false,
            sensitive: true,
        },
    ],
    documentationUrl: 'https://www.example.com',
    events: [
        events_1.FEATURE_CREATED,
        events_1.FEATURE_UPDATED,
        events_1.FEATURE_ARCHIVED,
        events_1.FEATURE_REVIVED,
    ],
    tagTypes: [
        {
            name: 'me',
            description: 'Some tag',
            icon: 'm',
        },
    ],
};
class SimpleAddon extends addon_1.default {
    constructor() {
        super(definition, ARGS);
        this.events = [];
    }
    getEvents() {
        return this.events;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async handleEvent(event, parameters) {
        this.events.push({
            event,
            parameters,
        });
    }
}
exports.default = SimpleAddon;
//# sourceMappingURL=addon-service-test-simple-addon.js.map