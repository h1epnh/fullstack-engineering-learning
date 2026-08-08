"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectStatusService = void 0;
const project_health_1 = require("../../domain/project-health/project-health");
class ProjectStatusService {
    constructor({ eventStore, projectStore, apiTokenStore, segmentStore, featureTypeStore, featureToggleStore, }, projectLifecycleReadModel, projectStaleFlagsReadModel) {
        this.eventStore = eventStore;
        this.projectStore = projectStore;
        this.apiTokenStore = apiTokenStore;
        this.segmentStore = segmentStore;
        this.projectLifecycleSummaryReadModel = projectLifecycleReadModel;
        this.projectStaleFlagsReadModel = projectStaleFlagsReadModel;
        this.featureTypeStore = featureTypeStore;
        this.featureToggleStore = featureToggleStore;
    }
    async getProjectStatus(projectId) {
        const [members, apiTokens, segments, activityCountByDate, currentHealth, lifecycleSummary, staleFlagCount,] = await Promise.all([
            this.projectStore.getMembersCountByProject(projectId),
            this.apiTokenStore.countProjectTokens(projectId),
            this.segmentStore.getProjectSegmentCount(projectId),
            this.eventStore.getProjectRecentEventActivity(projectId),
            (0, project_health_1.calculateProjectHealthRating)(this.featureTypeStore, this.featureToggleStore)({ id: projectId }),
            this.projectLifecycleSummaryReadModel.getProjectLifecycleSummary(projectId),
            this.projectStaleFlagsReadModel.getStaleFlagCountForProject(projectId),
        ]);
        return {
            resources: {
                members,
                apiTokens,
                segments,
            },
            activityCountByDate,
            health: {
                current: currentHealth,
            },
            lifecycleSummary,
            staleFlags: {
                total: staleFlagCount,
            },
        };
    }
}
exports.ProjectStatusService = ProjectStatusService;
//# sourceMappingURL=project-status-service.js.map