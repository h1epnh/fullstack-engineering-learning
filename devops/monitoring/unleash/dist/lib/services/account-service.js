"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
const model_1 = require("../types/model");
const error_1 = require("../error");
class AccountService {
    constructor(stores, { getLogger }, services) {
        this.lastSeenSecrets = new Set();
        this.logger = getLogger('service/account-service.ts');
        this.store = stores.accountStore;
        this.accessService = services.accessService;
    }
    async getAll() {
        const accounts = await this.store.getAll();
        const defaultRole = await this.accessService.getPredefinedRole(model_1.RoleName.VIEWER);
        const userRoles = await this.accessService.getRootRoleForAllUsers();
        const accountsWithRootRole = accounts.map((u) => {
            const rootRole = userRoles.find((r) => r.userId === u.id);
            const roleId = rootRole ? rootRole.roleId : defaultRole.id;
            return { ...u, rootRole: roleId };
        });
        return accountsWithRootRole;
    }
    async getAccountByPersonalAccessToken(secret) {
        const account = await this.store.getAccountByPersonalAccessToken(secret);
        if (account === undefined) {
            throw new error_1.NotFoundError();
        }
        return account;
    }
    async getAdminCount() {
        return this.store.getAdminCount();
    }
    async updateLastSeen() {
        if (this.lastSeenSecrets.size > 0) {
            const toStore = [...this.lastSeenSecrets];
            this.lastSeenSecrets = new Set();
            await this.store.markSeenAt(toStore);
        }
    }
    addPATSeen(secret) {
        this.lastSeenSecrets.add(secret);
    }
}
exports.AccountService = AccountService;
//# sourceMappingURL=account-service.js.map