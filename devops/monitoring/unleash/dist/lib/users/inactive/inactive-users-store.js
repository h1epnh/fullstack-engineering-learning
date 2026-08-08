"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InactiveUsersStore = void 0;
const metrics_helper_1 = __importDefault(require("../../util/metrics-helper"));
const metric_events_1 = require("../../metric-events");
const TABLE = 'users';
class InactiveUsersStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.logger = getLogger('users/inactive/inactive-users-store.ts');
        this.eventEmitter = eventBus;
        this.timer = (action) => metrics_helper_1.default.wrapTimer(eventBus, metric_events_1.DB_TIME, {
            store: 'inactive_users',
            action,
        });
    }
    async getInactiveUsers(daysInactive) {
        const stopTimer = this.timer('get_inactive_users');
        const inactiveUsers = await this.db(TABLE)
            .select('users.id AS id', 'users.name AS name', 'users.username AS username', 'users.email AS email', 'users.seen_at AS seen_at', 'pat.seen_at AS pat_seen_at', 'users.created_at AS created_at')
            .leftJoin('personal_access_tokens AS pat', 'pat.user_id', 'users.id')
            .where('deleted_at', null)
            .andWhere('is_service', false)
            .andWhere('is_system', false)
            .andWhereRaw(`(users.seen_at IS NULL OR users.seen_at < now() - INTERVAL '?? days')
        AND (users.created_at IS NULL OR users.created_at < now() - INTERVAL '?? days')
        AND (pat.seen_at IS NULL OR pat.seen_at < now() - INTERVAL '?? days')`, [daysInactive, daysInactive, daysInactive]);
        stopTimer();
        return inactiveUsers;
    }
}
exports.InactiveUsersStore = InactiveUsersStore;
//# sourceMappingURL=inactive-users-store.js.map