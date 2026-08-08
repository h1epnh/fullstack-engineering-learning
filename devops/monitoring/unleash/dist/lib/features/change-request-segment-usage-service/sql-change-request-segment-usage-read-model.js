"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeRequestSegmentUsageReadModel = void 0;
class ChangeRequestSegmentUsageReadModel {
    constructor(db) {
        this.db = db;
    }
    async getStrategiesUsedInActiveChangeRequests(segmentId) {
        const query = this.db.raw(`SELECT events.*, cr.project, cr.environment, cr.title
             FROM change_request_events events
             JOIN change_requests cr ON events.change_request_id = cr.id
             WHERE cr.state NOT IN ('Applied', 'Cancelled', 'Rejected')
             AND events.action IN ('updateStrategy', 'addStrategy');`);
        const queryResult = await query;
        const strategies = queryResult.rows
            .filter((row) => row.payload?.segments?.includes(segmentId))
            .map((row) => {
            const { payload, project, environment, feature } = row;
            return {
                projectId: project,
                featureName: feature,
                environment: environment,
                strategyName: payload.name,
                ...(payload.id ? { id: payload.id } : {}),
                changeRequest: {
                    id: row.change_request_id,
                    title: row.title || null,
                },
            };
        });
        return strategies;
    }
}
exports.ChangeRequestSegmentUsageReadModel = ChangeRequestSegmentUsageReadModel;
//# sourceMappingURL=sql-change-request-segment-usage-read-model.js.map