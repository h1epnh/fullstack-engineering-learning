"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectInsightsService = void 0;
const time_to_production_1 = require("../feature-toggle/time-to-production/time-to-production");
const project_health_1 = require("../../domain/project-health/project-health");
const date_fns_1 = require("date-fns");
class ProjectInsightsService {
    constructor({ projectStore, featureToggleStore, featureTypeStore, projectStatsStore, featureStrategiesStore, }) {
        this.projectStore = projectStore;
        this.featureToggleStore = featureToggleStore;
        this.featureTypeStore = featureTypeStore;
        this.featureStrategiesStore = featureStrategiesStore;
        this.projectStatsStore = projectStatsStore;
    }
    async getDoraMetrics(projectId) {
        const activeFeatureToggles = (await this.featureToggleStore.getAll({ project: projectId })).map((feature) => feature.name);
        const archivedFeatureToggles = (await this.featureToggleStore.getAll({
            project: projectId,
            archived: true,
        })).map((feature) => feature.name);
        const featureToggleNames = [
            ...activeFeatureToggles,
            ...archivedFeatureToggles,
        ];
        const projectAverage = (0, time_to_production_1.calculateAverageTimeToProd)(await this.projectStatsStore.getTimeToProdDates(projectId));
        const toggleAverage = await this.projectStatsStore.getTimeToProdDatesForFeatureToggles(projectId, featureToggleNames);
        return {
            features: toggleAverage,
            projectAverage: projectAverage,
        };
    }
    async getHealthInsights(projectId) {
        const [overview, featureTypes] = await Promise.all([
            this.getProjectHealth(projectId, false, undefined),
            this.featureTypeStore.getAll(),
        ]);
        const { activeCount, potentiallyStaleCount, staleCount } = (0, project_health_1.calculateProjectHealth)(overview.features, featureTypes);
        return {
            activeCount,
            potentiallyStaleCount,
            staleCount,
            rating: overview.health,
        };
    }
    async getProjectHealth(projectId, archived = false, userId) {
        const [project, features] = await Promise.all([
            this.projectStore.get(projectId),
            this.featureStrategiesStore.getFeatureOverview({
                projectId,
                archived,
                userId,
            }),
        ]);
        return {
            health: project?.health || 0,
            features: features,
        };
    }
    async getProjectMembers(projectId) {
        const dateMinusThirtyDays = (0, date_fns_1.subDays)(new Date(), 30).toISOString();
        const [currentMembers, change] = await Promise.all([
            this.projectStore.getMembersCountByProject(projectId),
            this.projectStore.getMembersCountByProjectAfterDate(projectId, dateMinusThirtyDays),
        ]);
        return {
            currentMembers,
            change,
        };
    }
    async getProjectInsights(projectId) {
        const [stats, featureTypeCounts, health, leadTime, members] = await Promise.all([
            this.projectStatsStore.getProjectStats(projectId),
            this.featureToggleStore.getFeatureTypeCounts({
                projectId,
                archived: false,
            }),
            this.getHealthInsights(projectId),
            this.getDoraMetrics(projectId),
            this.getProjectMembers(projectId),
        ]);
        return {
            stats,
            featureTypeCounts,
            health,
            leadTime,
            members,
        };
    }
}
exports.ProjectInsightsService = ProjectInsightsService;
//# sourceMappingURL=project-insights-service.js.map