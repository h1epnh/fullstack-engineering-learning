"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const project_health_1 = require("../domain/project-health/project-health");
class ProjectHealthService {
    constructor({ projectStore, featureTypeStore, featureToggleStore, }, { getLogger }, projectService) {
        this.logger = getLogger('services/project-health-service.ts');
        this.projectStore = projectStore;
        this.featureTypeStore = featureTypeStore;
        this.featureToggleStore = featureToggleStore;
        this.projectService = projectService;
        this.calculateHealthRating = (0, project_health_1.calculateProjectHealthRating)(this.featureTypeStore, this.featureToggleStore);
    }
    async getProjectHealthReport(projectId) {
        const featureTypes = await this.featureTypeStore.getAll();
        const overview = await this.projectService.getProjectHealth(projectId, false, undefined);
        const healthRating = (0, project_health_1.calculateProjectHealth)(overview.features, featureTypes);
        return {
            ...overview,
            ...healthRating,
        };
    }
    async setHealthRating() {
        const projects = await this.projectStore.getAll();
        await Promise.all(projects.map(async (project) => {
            const newHealth = await this.calculateHealthRating(project);
            await this.projectStore.updateHealth({
                id: project.id,
                health: newHealth,
            });
        }));
    }
}
exports.default = ProjectHealthService;
//# sourceMappingURL=project-health-service.js.map