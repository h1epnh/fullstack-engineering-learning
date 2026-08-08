"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserUnsubscribeStore = exports.TABLE = void 0;
const COLUMNS = ['user_id', 'subscription', 'created_at'];
exports.TABLE = 'user_unsubscription';
class UserUnsubscribeStore {
    constructor(db) {
        this.db = db;
    }
    async insert({ userId, subscription }) {
        await this.db
            .table(exports.TABLE)
            .insert({ user_id: userId, subscription: subscription })
            .onConflict(['user_id', 'subscription'])
            .ignore()
            .returning(COLUMNS);
    }
    async delete({ userId, subscription }) {
        await this.db
            .table(exports.TABLE)
            .where({ user_id: userId, subscription: subscription })
            .del();
    }
    destroy() { }
}
exports.UserUnsubscribeStore = UserUnsubscribeStore;
//# sourceMappingURL=user-unsubscribe-store.js.map