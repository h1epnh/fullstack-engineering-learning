"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiTokenService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const permissions_1 = require("../types/permissions");
const api_user_1 = __importDefault(require("../types/api-user"));
const api_token_1 = require("../types/models/api-token");
const db_error_1 = require("../error/db-error");
const bad_data_error_1 = __importDefault(require("../error/bad-data-error"));
const constantTimeCompare_1 = require("../util/constantTimeCompare");
const types_1 = require("../types");
const util_1 = require("../util");
const date_fns_1 = require("date-fns");
const metrics_helper_1 = __importDefault(require("../util/metrics-helper"));
const metric_events_1 = require("../metric-events");
const exceeds_limit_error_1 = require("../error/exceeds-limit-error");
const resolveTokenPermissions = (tokenType) => {
    if (tokenType === api_token_1.ApiTokenType.ADMIN) {
        return [permissions_1.ADMIN];
    }
    if (tokenType === api_token_1.ApiTokenType.CLIENT) {
        return [permissions_1.CLIENT];
    }
    if (tokenType === api_token_1.ApiTokenType.FRONTEND) {
        return [permissions_1.FRONTEND];
    }
    return [];
};
class ApiTokenService {
    constructor({ apiTokenStore, environmentStore, }, config, eventService) {
        this.activeTokens = [];
        this.queryAfter = new Map();
        this.lastSeenSecrets = new Set();
        this.store = apiTokenStore;
        this.eventService = eventService;
        this.environmentStore = environmentStore;
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger('/services/api-token-service.ts');
        this.resourceLimits = config.resourceLimits;
        if (!this.flagResolver.isEnabled('useMemoizedActiveTokens')) {
            // This is probably not needed because the scheduler will run it
            this.fetchActiveTokens();
        }
        this.updateLastSeen();
        if (config.authentication.initApiTokens.length > 0) {
            process.nextTick(async () => this.initApiTokens(config.authentication.initApiTokens));
        }
        this.timer = (functionName) => metrics_helper_1.default.wrapTimer(config.eventBus, metric_events_1.FUNCTION_TIME, {
            className: 'ApiTokenService',
            functionName,
        });
        this.eventBus = config.eventBus;
    }
    /**
     * Called by a scheduler without jitter to refresh all active tokens
     */
    async fetchActiveTokens() {
        try {
            this.activeTokens = await this.store.getAllActive();
        }
        catch (e) {
            this.logger.warn('Failed to fetch active tokens', e);
        }
    }
    async getToken(secret) {
        return this.store.get(secret);
    }
    async getTokenWithCache(secret) {
        if (!secret) {
            return undefined;
        }
        let token = this.activeTokens.find((activeToken) => Boolean(activeToken.secret) &&
            (0, constantTimeCompare_1.constantTimeCompare)(activeToken.secret, secret));
        // If the token is not found, try to find it in the legacy format with alias.
        // This allows us to support the old format of tokens migrating to the embedded proxy.
        if (!token) {
            token = this.activeTokens.find((activeToken) => Boolean(activeToken.alias) &&
                (0, constantTimeCompare_1.constantTimeCompare)(activeToken.alias, secret));
        }
        const nextAllowedQuery = this.queryAfter.get(secret) ?? 0;
        if (!token) {
            if ((0, date_fns_1.isPast)(nextAllowedQuery)) {
                if (this.queryAfter.size > 1000) {
                    // establish a max limit for queryAfter size to prevent memory leak
                    this.queryAfter.clear();
                }
                const stopCacheTimer = this.timer('getTokenWithCache.query');
                token = await this.store.get(secret);
                if (token) {
                    if (token?.expiresAt && (0, date_fns_1.isPast)(token.expiresAt)) {
                        this.logger.info('Token has expired');
                        // prevent querying the same invalid secret multiple times. Expire after 5 minutes
                        this.queryAfter.set(secret, (0, date_fns_1.addMinutes)(new Date(), 5));
                        token = undefined;
                    }
                    else {
                        this.activeTokens.push(token);
                    }
                }
                else {
                    // prevent querying the same invalid secret multiple times. Expire after 5 minutes
                    this.queryAfter.set(secret, (0, date_fns_1.addMinutes)(new Date(), 5));
                }
                stopCacheTimer();
            }
            else {
                this.logger.info(`Not allowed to query this token until: ${this.queryAfter.get(secret)}`);
            }
        }
        return token;
    }
    async updateLastSeen() {
        if (this.lastSeenSecrets.size > 0) {
            const toStore = [...this.lastSeenSecrets];
            this.lastSeenSecrets = new Set();
            await this.store.markSeenAt(toStore);
        }
    }
    async getAllTokens() {
        return this.store.getAll();
    }
    async initApiTokens(tokens) {
        const tokenCount = await this.store.count();
        if (tokenCount > 0) {
            return;
        }
        try {
            const createAll = tokens
                .map(api_token_1.mapLegacyTokenWithSecret)
                .map((t) => this.insertNewApiToken(t, types_1.SYSTEM_USER_AUDIT));
            await Promise.all(createAll);
        }
        catch (e) {
            this.logger.error('Unable to create initial Admin API tokens');
        }
    }
    async getUserForToken(secret) {
        const token = await this.getTokenWithCache(secret);
        if (token) {
            this.lastSeenSecrets.add(token.secret);
            const apiUser = new api_user_1.default({
                tokenName: token.tokenName,
                permissions: resolveTokenPermissions(token.type),
                projects: token.projects,
                environment: token.environment,
                type: token.type,
                secret: token.secret,
            });
            apiUser.internalAdminTokenUserId =
                token.type === api_token_1.ApiTokenType.ADMIN
                    ? types_1.ADMIN_TOKEN_USER.id
                    : undefined;
            return apiUser;
        }
        return undefined;
    }
    async updateExpiry(secret, expiresAt, auditUser) {
        const previous = (await this.store.get(secret));
        const token = (await this.store.setExpiry(secret, expiresAt));
        await this.eventService.storeEvent(new types_1.ApiTokenUpdatedEvent({
            auditUser,
            previousToken: (0, util_1.omitKeys)(previous, 'secret'),
            apiToken: (0, util_1.omitKeys)(token, 'secret'),
        }));
        return token;
    }
    async delete(secret, auditUser) {
        if (await this.store.exists(secret)) {
            const token = (await this.store.get(secret));
            await this.store.delete(secret);
            await this.eventService.storeEvent(new types_1.ApiTokenDeletedEvent({
                auditUser,
                apiToken: (0, util_1.omitKeys)(token, 'secret'),
            }));
        }
    }
    /**
     * @deprecated This may be removed in a future release, prefer createApiTokenWithProjects
     */
    async createApiToken(newToken, auditUser = types_1.SYSTEM_USER_AUDIT) {
        const token = (0, api_token_1.mapLegacyToken)(newToken);
        return this.internalCreateApiTokenWithProjects(token, auditUser);
    }
    /**
     * @param newToken
     * @param createdBy should be IApiUser or IUser. Still supports optional or string for backward compatibility
     * @param createdByUserId still supported for backward compatibility
     */
    async createApiTokenWithProjects(newToken, auditUser = types_1.SYSTEM_USER_AUDIT) {
        return this.internalCreateApiTokenWithProjects(newToken, auditUser);
    }
    async internalCreateApiTokenWithProjects(newToken, auditUser) {
        (0, api_token_1.validateApiToken)(newToken);
        const environments = await this.environmentStore.getAll();
        (0, api_token_1.validateApiTokenEnvironment)(newToken, environments);
        await this.validateApiTokenLimit();
        const secret = this.generateSecretKey(newToken);
        const createNewToken = { ...newToken, secret };
        return this.insertNewApiToken(createNewToken, auditUser);
    }
    async validateApiTokenLimit() {
        const currentTokenCount = await this.store.count();
        const limit = this.resourceLimits.apiTokens;
        if (currentTokenCount >= limit) {
            (0, exceeds_limit_error_1.throwExceedsLimitError)(this.eventBus, {
                resource: 'api token',
                limit,
            });
        }
    }
    // TODO: Remove this service method after embedded proxy has been released in
    // 4.16.0
    async createMigratedProxyApiToken(newToken) {
        (0, api_token_1.validateApiToken)(newToken);
        const secret = this.generateSecretKey(newToken);
        const createNewToken = { ...newToken, secret };
        return this.insertNewApiToken(createNewToken, types_1.SYSTEM_USER_AUDIT);
    }
    normalizeTokenType(token) {
        const { type, ...rest } = token;
        return {
            ...rest,
            type: type.toLowerCase(),
        };
    }
    async insertNewApiToken(newApiToken, auditUser) {
        try {
            const token = await this.store.insert(this.normalizeTokenType(newApiToken));
            this.activeTokens.push(token);
            await this.eventService.storeEvent(new types_1.ApiTokenCreatedEvent({
                auditUser,
                apiToken: (0, util_1.omitKeys)(token, 'secret'),
            }));
            return token;
        }
        catch (error) {
            if (error.code === db_error_1.FOREIGN_KEY_VIOLATION) {
                let { message } = error;
                if (error.constraint === 'api_token_project_project_fkey') {
                    message = `Project=${this.findInvalidProject(error.detail, newApiToken.projects)} does not exist`;
                }
                else if (error.constraint === 'api_tokens_environment_fkey') {
                    message = `Environment=${newApiToken.environment} does not exist`;
                }
                throw new bad_data_error_1.default(message);
            }
            throw error;
        }
    }
    findInvalidProject(errorDetails, projects) {
        if (!errorDetails) {
            return 'invalid';
        }
        const invalidProject = projects.find((project) => {
            return errorDetails.includes(`=(${project})`);
        });
        return invalidProject || 'invalid';
    }
    generateSecretKey({ projects, environment }) {
        const randomStr = crypto_1.default.randomBytes(28).toString('hex');
        if (projects.length > 1) {
            return `[]:${environment}.${randomStr}`;
        }
        else {
            return `${projects[0]}:${environment}.${randomStr}`;
        }
    }
}
exports.ApiTokenService = ApiTokenService;
//# sourceMappingURL=api-token-service.js.map