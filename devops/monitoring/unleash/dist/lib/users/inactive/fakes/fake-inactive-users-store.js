"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeInactiveUsersStore = void 0;
const date_fns_1 = require("date-fns");
class FakeInactiveUsersStore {
    constructor(users) {
        this.users = [];
        this.users = users ?? [];
    }
    getInactiveUsers(daysInactive) {
        return Promise.resolve(this.users
            .filter((user) => {
            if (user.seenAt) {
                return user.seenAt < (0, date_fns_1.subDays)(new Date(), daysInactive);
            }
            else if (user.createdAt) {
                return (user.createdAt < (0, date_fns_1.subDays)(new Date(), daysInactive));
            }
        })
            .map((user) => {
            return {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                seen_at: user.seenAt,
                created_at: user.createdAt || new Date(),
            };
        }));
    }
}
exports.FakeInactiveUsersStore = FakeInactiveUsersStore;
//# sourceMappingURL=fake-inactive-users-store.js.map