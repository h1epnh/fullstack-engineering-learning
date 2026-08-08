"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const metrics_helper_1 = __importDefault(require("../util/metrics-helper"));
const metric_events_1 = require("../metric-events");
const TABLE = 'project_stats';
const PROJECT_STATS_COLUMNS = [
    'avg_time_to_prod_current_window',
    'project',
    'features_created_current_window',
    'features_created_past_window',
    'features_archived_current_window',
    'features_archived_past_window',
    'project_changes_current_window',
    'project_changes_past_window',
    'project_members_added_current_window',
];
class ProjectStatsStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.logger = getLogger('project-stats-store.ts');
        this.timer = (action) => metrics_helper_1.default.wrapTimer(eventBus, metric_events_1.DB_TIME, {
            store: 'project_stats',
            action,
        });
    }
    async updateProjectStats(projectId, status) {
        await this.db(TABLE)
            .insert({
            avg_time_to_prod_current_window: status.avgTimeToProdCurrentWindow,
            project: projectId,
            features_created_current_window: status.createdCurrentWindow,
            features_created_past_window: status.createdPastWindow,
            features_archived_current_window: status.archivedCurrentWindow,
            features_archived_past_window: status.archivedPastWindow,
            project_changes_current_window: status.projectActivityCurrentWindow,
            project_changes_past_window: status.projectActivityPastWindow,
            project_members_added_current_window: status.projectMembersAddedCurrentWindow,
        })
            .onConflict('project')
            .merge();
    }
    async getProjectStats(projectId) {
        const row = await this.db(TABLE)
            .select(PROJECT_STATS_COLUMNS)
            .where({ project: projectId })
            .first();
        return this.mapRow(row);
    }
    mapRow(row) {
        if (!row) {
            return {
                avgTimeToProdCurrentWindow: 0,
                createdCurrentWindow: 0,
                createdPastWindow: 0,
                archivedCurrentWindow: 0,
                archivedPastWindow: 0,
                projectActivityCurrentWindow: 0,
                projectActivityPastWindow: 0,
                projectMembersAddedCurrentWindow: 0,
            };
        }
        return {
            avgTimeToProdCurrentWindow: row.avg_time_to_prod_current_window,
            createdCurrentWindow: row.features_created_current_window,
            createdPastWindow: row.features_created_past_window,
            archivedCurrentWindow: row.features_archived_current_window,
            archivedPastWindow: row.features_archived_past_window,
            projectActivityCurrentWindow: row.project_changes_current_window,
            projectActivityPastWindow: row.project_changes_past_window,
            projectMembersAddedCurrentWindow: row.project_members_added_current_window,
        };
    }
    // we're not calculating time difference in a DB as it requires specialized
    // time aware libraries
    async getTimeToProdDates(projectId) {
        const result = await this.db
            .select('events.feature_name')
            // select only first enabled event, distinct works with orderBy
            .distinctOn('events.feature_name')
            .select(this.db.raw('events.created_at as enabled, features.created_at as created'))
            .from('events')
            .innerJoin('environments', 'environments.name', '=', 'events.environment')
            .innerJoin('features', 'features.name', '=', 'events.feature_name')
            .where('events.type', '=', 'feature-environment-enabled')
            .where('environments.type', '=', 'production')
            .where('features.type', '=', 'release')
            // exclude events for features that were previously deleted
            .where(this.db.raw('events.created_at > features.created_at'))
            .where('features.project', '=', projectId)
            .orderBy('events.feature_name')
            // first enabled event
            .orderBy('events.created_at', 'asc');
        return result;
    }
    async getTimeToProdDatesForFeatureToggles(projectId, featureToggleNames) {
        const result = await this.db
            .select('events.feature_name')
            .distinctOn('events.feature_name')
            .select(this.db.raw('events.created_at as enabled, features.created_at as created'))
            .from('events')
            .innerJoin('environments', 'environments.name', '=', 'events.environment')
            .innerJoin('features', 'features.name', '=', 'events.feature_name')
            .whereIn('events.feature_name', featureToggleNames)
            .where('events.type', '=', 'feature-environment-enabled')
            .where('environments.type', '=', 'production')
            .where('features.type', '=', 'release')
            .where(this.db.raw('events.created_at > features.created_at'))
            .where('features.project', '=', projectId)
            .orderBy('events.feature_name')
            .orderBy('events.created_at', 'asc');
        const timeDifferenceData = result.map((row) => {
            const enabledDate = new Date(row.enabled).getTime();
            const createdDate = new Date(row.created).getTime();
            const timeDifferenceInDays = Math.floor((enabledDate - createdDate) / (1000 * 60 * 60 * 24));
            return {
                name: row.feature_name,
                timeToProduction: timeDifferenceInDays,
            };
        });
        return timeDifferenceData;
    }
}
exports.default = ProjectStatsStore;
//# sourceMappingURL=project-stats-store.js.map