"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const crypto_1 = __importDefault(require("crypto"));
const bad_data_error_1 = __importDefault(require("../error/bad-data-error"));
const name_exists_error_1 = __importDefault(require("../error/name-exists-error"));
const operation_denied_error_1 = require("../error/operation-denied-error");
const constants_1 = require("../util/constants");
class PatService {
    constructor({ patStore }, config, eventService) {
        this.config = config;
        this.logger = config.getLogger('services/pat-service.ts');
        this.patStore = patStore;
        this.eventService = eventService;
    }
    async createPat(pat, forUserId, auditUser) {
        await this.validatePat(pat, forUserId);
        const secret = this.generateSecretKey();
        const newPat = await this.patStore.create(pat, secret, forUserId);
        await this.eventService.storeEvent(new types_1.PatCreatedEvent({
            data: { ...pat, secret: '***' },
            auditUser,
        }));
        return { ...newPat, secret };
    }
    async getAll(userId) {
        return this.patStore.getAllByUser(userId);
    }
    async deletePat(id, forUserId, auditUser) {
        const pat = await this.patStore.get(id);
        await this.eventService.storeEvent(new types_1.PatDeletedEvent({
            data: { ...pat, secret: '***' },
            auditUser,
        }));
        return this.patStore.deleteForUser(id, forUserId);
    }
    async validatePat({ description, expiresAt }, userId) {
        if (!description) {
            throw new bad_data_error_1.default('PAT description cannot be empty.');
        }
        if (new Date(expiresAt) < new Date()) {
            throw new bad_data_error_1.default('The expiry date should be in future.');
        }
        if ((await this.patStore.countByUser(userId)) >= constants_1.PAT_LIMIT) {
            throw new operation_denied_error_1.OperationDeniedError(`Too many PATs (${constants_1.PAT_LIMIT}) already exist for this user.`);
        }
        if (await this.patStore.existsWithDescriptionByUser(description, userId)) {
            throw new name_exists_error_1.default('PAT description already exists.');
        }
    }
    generateSecretKey() {
        const randomStr = crypto_1.default.randomBytes(28).toString('hex');
        return `user:${randomStr}`;
    }
}
exports.default = PatService;
module.exports = PatService;
//# sourceMappingURL=pat-service.js.map