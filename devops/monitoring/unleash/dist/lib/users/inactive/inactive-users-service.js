"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InactiveUsersService = void 0;
const types_1 = require("../../types");
class InactiveUsersService {
    constructor({ inactiveUsersStore }, { getLogger, userInactivityThresholdInDays, }, services) {
        this.logger = getLogger('services/client-feature-toggle-service.ts');
        this.inactiveUsersStore = inactiveUsersStore;
        this.userService = services.userService;
        this.userInactivityThresholdInDays = userInactivityThresholdInDays;
    }
    async getInactiveUsers() {
        const users = await this.inactiveUsersStore.getInactiveUsers(this.userInactivityThresholdInDays);
        if (users.length > 0) {
            return users.map((user) => {
                return (0, types_1.serializeDates)({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    seenAt: user.seen_at,
                    createdAt: user.created_at,
                    patSeenAt: user.pat_seen_at,
                });
            });
        }
        else {
            return [];
        }
    }
    async deleteInactiveUsers(calledByUser, userIds) {
        this.logger.info('Deleting inactive users');
        for (const userid of userIds) {
            if (calledByUser.id !== userid) {
                await this.userService.deleteUser(userid, calledByUser);
            }
        }
    }
}
exports.InactiveUsersService = InactiveUsersService;
//# sourceMappingURL=inactive-users-service.js.map