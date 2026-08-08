"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicSignupTokenService = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const types_1 = require("../types");
const model_1 = require("../types/model");
const events_1 = require("../types/events");
const url_1 = require("url");
const date_fns_1 = require("date-fns");
const error_1 = require("../error");
class PublicSignupTokenService {
    constructor({ publicSignupTokenStore, roleStore, }, config, userService, eventService) {
        this.store = publicSignupTokenStore;
        this.userService = userService;
        this.eventService = eventService;
        this.roleStore = roleStore;
        this.logger = config.getLogger('/services/public-signup-token-service.ts');
        this.unleashBase = config.server.unleashUrl;
    }
    getUrl(secret) {
        return new url_1.URL(`${this.unleashBase}/new-user?invite=${secret}`).toString();
    }
    async get(secret) {
        const token = await this.store.get(secret);
        if (token === undefined) {
            throw new error_1.NotFoundError('Could not find token with that secret');
        }
        return token;
    }
    async getAllTokens() {
        return this.store.getAll();
    }
    async validate(secret) {
        return this.store.isValid(secret);
    }
    async update(secret, { expiresAt, enabled }, auditUser) {
        const result = await this.store.update(secret, { expiresAt, enabled });
        await this.eventService.storeEvent(new events_1.PublicSignupTokenUpdatedEvent({
            auditUser,
            data: { secret, enabled, expiresAt },
        }));
        return result;
    }
    async addTokenUser(secret, createUser, auditUser) {
        const token = await this.get(secret);
        if (token === undefined) {
            throw new error_1.NotFoundError('Could not find token with that secret');
        }
        const user = await this.userService.createUser({
            ...createUser,
            rootRole: token.role.id,
        }, auditUser);
        await this.store.addTokenUser(secret, user.id);
        await this.eventService.storeEvent(new events_1.PublicSignupTokenUserAddedEvent({
            auditUser: types_1.SYSTEM_USER_AUDIT,
            data: { secret, userId: user.id },
        }));
        return user;
    }
    async createNewPublicSignupToken(tokenCreate, auditUser) {
        const viewerRole = await this.roleStore.getRoleByName(model_1.RoleName.VIEWER);
        const secret = this.generateSecretKey();
        const url = this.getUrl(secret);
        const cappedDate = this.getMinimumDate(new Date(tokenCreate.expiresAt), (0, date_fns_1.add)(new Date(), { months: 1 }));
        const newToken = {
            name: tokenCreate.name,
            expiresAt: cappedDate,
            secret: secret,
            roleId: viewerRole ? viewerRole.id : -1,
            createdBy: auditUser.username,
            url: url,
        };
        const token = await this.store.insert(newToken);
        await this.eventService.storeEvent(new events_1.PublicSignupTokenCreatedEvent({
            auditUser,
            data: token,
        }));
        return token;
    }
    generateSecretKey() {
        return node_crypto_1.default.randomBytes(16).toString('hex');
    }
    getMinimumDate(date1, date2) {
        return date1 < date2 ? date1 : date2;
    }
}
exports.PublicSignupTokenService = PublicSignupTokenService;
//# sourceMappingURL=public-signup-token-service.js.map