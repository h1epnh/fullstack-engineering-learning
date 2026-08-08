import type { IUnleashStores } from '../../types';
import type { ProjectDoraMetricsSchema } from '../../openapi';
export declare class ProjectInsightsService {
    private projectStore;
    private featureToggleStore;
    private featureTypeStore;
    private featureStrategiesStore;
    private projectStatsStore;
    constructor({ projectStore, featureToggleStore, featureTypeStore, projectStatsStore, featureStrategiesStore, }: Pick<IUnleashStores, 'projectStore' | 'featureToggleStore' | 'projectStatsStore' | 'featureTypeStore' | 'featureStrategiesStore'>);
    getDoraMetrics(projectId: string): Promise<ProjectDoraMetricsSchema>;
    private getHealthInsights;
    private getProjectHealth;
    private getProjectMembers;
    getProjectInsights(projectId: string): Promise<{
        stats: import("../project/project-service").IProjectStats;
        featureTypeCounts: import("../../types").IFeatureTypeCount[];
        health: {
            activeCount: number;
            potentiallyStaleCount: number;
            staleCount: number;
            rating: number;
        };
        leadTime: {
            projectAverage?: number | undefined;
            features: {
                name: string;
                timeToProduction: number;
            }[];
        };
        members: {
            [x: string]: unknown;
            currentMembers: number;
            change: number;
        };
    }>;
}
//# sourceMappingURL=project-insights-service.d.ts.map