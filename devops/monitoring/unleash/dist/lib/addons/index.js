"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddons = void 0;
const webhook_1 = __importDefault(require("./webhook"));
const slack_1 = __importDefault(require("./slack"));
const teams_1 = __importDefault(require("./teams"));
const datadog_1 = __importDefault(require("./datadog"));
const new_relic_1 = __importDefault(require("./new-relic"));
const slack_app_1 = __importDefault(require("./slack-app"));
const getAddons = (args) => {
    const addons = [
        new webhook_1.default(args),
        new slack_1.default(args),
        new slack_app_1.default(args),
        new teams_1.default(args),
        new datadog_1.default(args),
        new new_relic_1.default(args),
    ];
    return addons.reduce((map, addon) => {
        // eslint-disable-next-line no-param-reassign
        map[addon.name] = addon;
        return map;
    }, {});
};
exports.getAddons = getAddons;
//# sourceMappingURL=index.js.map