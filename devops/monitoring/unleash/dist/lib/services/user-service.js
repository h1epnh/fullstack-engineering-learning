"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const owasp_password_strength_test_1 = __importDefault(require("owasp-password-strength-test"));
const joi_1 = __importDefault(require("joi"));
const user_1 = __importDefault(require("../types/user"));
const is_email_1 = __importDefault(require("../util/is-email"));
const notfound_error_1 = __importDefault(require("../error/notfound-error"));
const owasp_validation_error_1 = __importDefault(require("../error/owasp-validation-error"));
const password_undefined_1 = __importDefault(require("../error/password-undefined"));
const events_1 = require("../types/events");
const model_1 = require("../types/model");
const simple_auth_settings_1 = require("../types/settings/simple-auth-settings");
const disabled_error_1 = __importDefault(require("../error/disabled-error"));
const bad_data_error_1 = __importDefault(require("../error/bad-data-error"));
const isDefined_1 = require("../util/isDefined");
const password_mismatch_1 = __importDefault(require("../error/password-mismatch"));
const types_1 = require("../types");
const password_previously_used_1 = require("../error/password-previously-used");
const rate_limit_error_1 = require("../error/rate-limit-error");
const metric_events_1 = require("../metric-events");
const saltRounds = 10;
const disallowNPreviousPasswords = 5;
class UserService {
    constructor(stores, { server, getLogger, authentication, eventBus, flagResolver, session, }, services) {
        this.passwordResetTimeouts = {};
        this.logger = getLogger('service/user-service.js');
        this.store = stores.userStore;
        this.eventBus = eventBus;
        this.eventService = services.eventService;
        this.accessService = services.accessService;
        this.resetTokenService = services.resetTokenService;
        this.emailService = services.emailService;
        this.sessionService = services.sessionService;
        this.settingService = services.settingService;
        this.flagResolver = flagResolver;
        this.maxParallelSessions = session.maxParallelSessions;
        process.nextTick(() => this.initAdminUser(authentication));
        this.baseUriPath = server.baseUriPath || '';
        this.unleashUrl = server.unleashUrl;
    }
    validatePassword(password) {
        if (password) {
            const result = owasp_password_strength_test_1.default.test(password);
            if (!result.strong) {
                throw new owasp_validation_error_1.default(result);
            }
            else
                return true;
        }
        else {
            throw new password_undefined_1.default();
        }
    }
    async initAdminUser({ createAdminUser, initialAdminUser, }) {
        if (!createAdminUser)
            return Promise.resolve();
        return this.initAdminUsernameUser(initialAdminUser);
    }
    async initAdminUsernameUser(usernameAdminUser) {
        const username = usernameAdminUser?.username || 'admin';
        const password = usernameAdminUser?.password || 'unleash4all';
        const userCount = await this.store.count();
        if (userCount === 0) {
            // create default admin user
            try {
                this.logger.info(`Creating default admin user, with username '${username}' and password '${password}'`);
                const user = await this.store.insert({
                    username,
                });
                const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
                await this.store.setPasswordHash(user.id, passwordHash, disallowNPreviousPasswords);
                await this.accessService.setUserRootRole(user.id, model_1.RoleName.ADMIN);
            }
            catch (e) {
                this.logger.error(`Unable to create default user '${username}'`);
            }
        }
    }
    async getAll() {
        const users = await this.store.getAll();
        const defaultRole = await this.accessService.getPredefinedRole(model_1.RoleName.VIEWER);
        const userRoles = await this.accessService.getRootRoleForAllUsers();
        const usersWithRootRole = users.map((u) => {
            const rootRole = userRoles.find((r) => r.userId === u.id);
            const roleId = rootRole ? rootRole.roleId : defaultRole.id;
            return { ...u, rootRole: roleId };
        });
        if (this.flagResolver.isEnabled('showUserDeviceCount')) {
            const sessionCounts = await this.sessionService.getSessionsCount();
            const usersWithSessionCounts = usersWithRootRole.map((u) => ({
                ...u,
                activeSessions: sessionCounts[u.id] || 0,
            }));
            return usersWithSessionCounts;
        }
        return usersWithRootRole;
    }
    async getUser(id) {
        const user = await this.store.get(id);
        if (user === undefined) {
            throw new notfound_error_1.default(`Could not find user with id ${id}`);
        }
        const rootRole = await this.accessService.getRootRoleForUser(id);
        return { ...user, id, rootRole: rootRole.id };
    }
    async search(query) {
        return this.store.search(query);
    }
    async getByEmail(email) {
        return this.store.getByQuery({ email });
    }
    validateEmail(email) {
        if (email) {
            joi_1.default.assert(email, joi_1.default.string().email({
                ignoreLength: true,
                minDomainSegments: 1,
            }), 'Email');
        }
    }
    async createUser({ username, email, name, password, rootRole }, auditUser = types_1.SYSTEM_USER_AUDIT) {
        if (!username && !email) {
            throw new bad_data_error_1.default('You must specify username or email');
        }
        joi_1.default.assert(name, joi_1.default.string(), 'Name');
        this.validateEmail(email);
        const exists = await this.store.hasUser({ username, email });
        if (exists) {
            throw new bad_data_error_1.default('User already exists');
        }
        const user = await this.store.insert({
            username,
            email,
            name,
        });
        await this.accessService.setUserRootRole(user.id, rootRole);
        if (password) {
            const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
            await this.store.setPasswordHash(user.id, passwordHash, disallowNPreviousPasswords);
        }
        const userCreated = await this.getUser(user.id);
        await this.eventService.storeEvent(new events_1.UserCreatedEvent({
            auditUser,
            userCreated,
        }));
        return userCreated;
    }
    async newUserInviteLink(user, auditUser = types_1.SYSTEM_USER_AUDIT) {
        const passwordAuthSettings = await this.settingService.getWithDefault(simple_auth_settings_1.simpleAuthSettingsKey, { disabled: false });
        let inviteLink = this.unleashUrl;
        if (!passwordAuthSettings.disabled) {
            const inviteUrl = await this.resetTokenService.createNewUserUrl(user.id, auditUser.username);
            inviteLink = inviteUrl.toString();
        }
        return inviteLink;
    }
    async sendWelcomeEmail(user, inviteLink) {
        let emailSent = false;
        const emailConfigured = this.emailService.configured();
        if (emailConfigured && user.email) {
            try {
                await this.emailService.sendGettingStartedMail(user.name || '', user.email, this.unleashUrl, inviteLink);
                emailSent = true;
            }
            catch (e) {
                this.logger.warn('email was configured, but sending failed due to: ', e);
            }
        }
        else {
            this.logger.warn('email was not sent to the user because email configuration is lacking');
        }
        return emailSent;
    }
    async updateUser({ id, name, email, rootRole }, auditUser) {
        const preUser = await this.getUser(id);
        this.validateEmail(email);
        if (rootRole) {
            await this.accessService.setUserRootRole(id, rootRole);
        }
        const payload = {
            name: name || preUser.name,
            email: email || preUser.email,
        };
        // Empty updates will throw, so make sure we have something to update.
        const user = Object.values(payload).some(isDefined_1.isDefined)
            ? await this.store.update(id, payload)
            : preUser;
        const storedUser = await this.getUser(user.id);
        await this.eventService.storeEvent(new events_1.UserUpdatedEvent({
            auditUser,
            preUser: preUser,
            postUser: storedUser,
        }));
        return storedUser;
    }
    async deleteUser(userId, auditUser) {
        const user = await this.getUser(userId);
        await this.accessService.wipeUserPermissions(userId);
        await this.sessionService.deleteSessionsForUser(userId);
        await this.store.delete(userId);
        await this.eventService.storeEvent(new events_1.UserDeletedEvent({
            deletedUser: user,
            auditUser,
        }));
    }
    async deleteScimUsers(auditUser) {
        await this.store.deleteScimUsers();
        await this.eventService.storeEvent(new events_1.ScimUsersDeleted({
            data: null,
            auditUser,
        }));
    }
    async loginUser(usernameOrEmail, password, device) {
        const settings = await this.settingService.get(simple_auth_settings_1.simpleAuthSettingsKey);
        if (settings?.disabled) {
            throw new disabled_error_1.default('Logging in with username/password has been disabled.');
        }
        const idQuery = (0, is_email_1.default)(usernameOrEmail)
            ? { email: usernameOrEmail }
            : { username: usernameOrEmail };
        let user, passwordHash;
        try {
            user = await this.store.getByQuery(idQuery);
            passwordHash = await this.store.getPasswordHash(user.id);
        }
        catch (error) { }
        if (user && passwordHash) {
            const match = await bcryptjs_1.default.compare(password, passwordHash);
            if (match) {
                const loginOrder = await this.store.successfullyLogin(user);
                const sessions = await this.sessionService.getSessionsForUser(user.id);
                if (sessions.length >= 5 && device) {
                    this.logger.info(`Excessive login (user id: ${user.id}, user agent: ${device.userAgent}, IP: ${device.ip})`);
                }
                // subtract current user session that will be created
                const deletedSessionsCount = await this.sessionService.deleteStaleSessionsForUser(user.id, Math.max(this.maxParallelSessions - 1, 0));
                user.deletedSessions = deletedSessionsCount;
                user.activeSessions = this.maxParallelSessions;
                this.eventBus.emit(metric_events_1.USER_LOGIN, { loginOrder });
                return user;
            }
        }
        throw new password_mismatch_1.default(`The combination of password and username you provided is invalid. If you have forgotten your password, visit ${this.baseUriPath}/forgotten-password or get in touch with your instance administrator.`);
    }
    /**
     * Used to login users without specifying password. Used when integrating
     * with external identity providers.
     *
     * @param usernameOrEmail
     * @param autoCreateUser
     * @returns
     */
    async loginUserWithoutPassword(email, autoCreateUser = false) {
        return this.loginUserSSO({ email, autoCreate: autoCreateUser });
    }
    async loginUserSSO({ email, name, rootRole, autoCreate = false, }) {
        let user;
        try {
            user = await this.store.getByQuery({ email });
            // Update user if autCreate is enabled.
            if (name && user.name !== name) {
                user = await this.store.update(user.id, { name, email });
            }
        }
        catch (e) {
            // User does not exists. Create if 'autoCreate' is enabled
            if (autoCreate) {
                user = await this.createUser({
                    email,
                    name,
                    rootRole: rootRole || model_1.RoleName.EDITOR,
                }, types_1.SYSTEM_USER_AUDIT);
            }
            else {
                throw e;
            }
        }
        const loginOrder = await this.store.successfullyLogin(user);
        this.eventBus.emit(metric_events_1.USER_LOGIN, { loginOrder });
        return user;
    }
    async loginDemoAuthDefaultAdmin() {
        const user = await this.store.getByQuery({ id: 1 });
        const loginOrder = await this.store.successfullyLogin(user);
        this.eventBus.emit(metric_events_1.USER_LOGIN, { loginOrder });
        return user;
    }
    async changePassword(userId, password) {
        this.validatePassword(password);
        const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
        await this.store.setPasswordHash(userId, passwordHash, disallowNPreviousPasswords);
        await this.sessionService.deleteSessionsForUser(userId);
        await this.resetTokenService.expireExistingTokensForUser(userId);
    }
    async changePasswordWithPreviouslyUsedPasswordCheck(userId, password) {
        const previouslyUsed = await this.store.getPasswordsPreviouslyUsed(userId);
        const usedBefore = previouslyUsed.some((previouslyUsed) => bcryptjs_1.default.compareSync(password, previouslyUsed));
        if (usedBefore) {
            throw new password_previously_used_1.PasswordPreviouslyUsedError();
        }
        await this.changePassword(userId, password);
    }
    async changePasswordWithVerification(userId, newPassword, oldPassword) {
        const currentPasswordHash = await this.store.getPasswordHash(userId);
        const match = await bcryptjs_1.default.compare(oldPassword, currentPasswordHash);
        if (!match) {
            throw new password_mismatch_1.default(`The old password you provided is invalid. If you have forgotten your password, visit ${this.baseUriPath}/forgotten-password or get in touch with your instance administrator.`);
        }
        await this.changePasswordWithPreviouslyUsedPasswordCheck(userId, newPassword);
    }
    async getUserForToken(token) {
        const { createdBy, userId } = await this.resetTokenService.isValid(token);
        const user = await this.getUser(userId);
        const role = await this.accessService.getRoleData(user.rootRole);
        return {
            token,
            createdBy,
            email: user.email,
            name: user.name,
            id: user.id,
            role: {
                id: user.rootRole,
                description: role.role.description,
                type: role.role.type,
                name: role.role.name,
            },
        };
    }
    /**
     * If the password is a strong password will update password and delete all sessions for the user we're changing the password for
     * @param token - the token authenticating this request
     * @param password - new password
     */
    async resetPassword(token, password) {
        this.validatePassword(password);
        const user = await this.getUserForToken(token);
        await this.changePasswordWithPreviouslyUsedPasswordCheck(user.id, password);
        await this.resetTokenService.useAccessToken({
            userId: user.id,
            token,
        });
    }
    async createResetPasswordEmail(receiverEmail, user = new user_1.default({
        id: types_1.SYSTEM_USER.id,
        username: types_1.SYSTEM_USER.username,
    })) {
        const receiver = await this.getByEmail(receiverEmail);
        if (!receiver) {
            throw new notfound_error_1.default(`Could not find ${receiverEmail}`);
        }
        if (this.passwordResetTimeouts[receiver.id]) {
            throw new rate_limit_error_1.RateLimitError('You can only send one new reset password email per minute, per user. Please try again later.');
        }
        const resetLink = await this.resetTokenService.createResetPasswordUrl(receiver.id, user.username || user.email || types_1.SYSTEM_USER_AUDIT.username);
        this.passwordResetTimeouts[receiver.id] = setTimeout(() => {
            delete this.passwordResetTimeouts[receiver.id];
        }, 1000 * 60); // 1 minute
        await this.emailService.sendResetMail(receiver.name, receiverEmail, resetLink.toString());
        return resetLink;
    }
}
exports.default = UserService;
//# sourceMappingURL=user-service.js.map