"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGroupService = void 0;
const services_1 = require("../../services");
const group_store_1 = __importDefault(require("../../db/group-store"));
const account_store_1 = require("../../db/account-store");
const createEventsService_1 = require("../events/createEventsService");
const createGroupService = (db, config) => {
    const { getLogger } = config;
    const groupStore = new group_store_1.default(db);
    const accountStore = new account_store_1.AccountStore(db, getLogger);
    const eventService = (0, createEventsService_1.createEventsService)(db, config);
    const groupService = new services_1.GroupService({ groupStore, accountStore }, { getLogger }, eventService);
    return groupService;
};
exports.createGroupService = createGroupService;
//# sourceMappingURL=createGroupService.js.map