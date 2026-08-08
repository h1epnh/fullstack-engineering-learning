"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalDashboardService = void 0;
const util_1 = require("../../util");
const error_1 = require("../../error");
class PersonalDashboardService {
    constructor(personalDashboardReadModel, projectOwnersReadModel, projectReadModel, onboardingReadModel, eventStore, featureEventFormatter, privateProjectChecker, accountStore, accessStore) {
        this.personalDashboardReadModel = personalDashboardReadModel;
        this.projectOwnersReadModel = projectOwnersReadModel;
        this.projectReadModel = projectReadModel;
        this.onboardingReadModel = onboardingReadModel;
        this.eventStore = eventStore;
        this.featureEventFormatter = featureEventFormatter;
        this.privateProjectChecker = privateProjectChecker;
        this.accountStore = accountStore;
        this.accessStore = accessStore;
    }
    getPersonalFeatures(userId) {
        return this.personalDashboardReadModel.getPersonalFeatures(userId);
    }
    async getPersonalProjects(userId) {
        const [userProjectIds, userFavoritedProjectIds] = await Promise.all([
            this.projectReadModel.getProjectsByUser(userId),
            this.projectReadModel.getProjectsFavoritedByUser(userId),
        ]);
        const projects = await this.projectReadModel.getProjectsForAdminUi({
            ids: [...new Set([...userProjectIds, ...userFavoritedProjectIds])],
            archived: false,
        });
        const normalizedProjects = projects.map((project) => ({
            id: project.id,
            name: project.name,
            health: project.health,
            memberCount: project.memberCount,
            featureCount: project.featureCount,
        }));
        return normalizedProjects;
    }
    async getProjectOwners(userId) {
        const accessibleProjects = await this.privateProjectChecker.getUserAccessibleProjects(userId);
        const filter = accessibleProjects.mode === 'all'
            ? undefined
            : new Set(accessibleProjects.projects);
        return this.projectOwnersReadModel.getAllUserProjectOwners(filter);
    }
    async getPersonalProjectDetails(userId, projectId) {
        const onboardingStatus = await this.onboardingReadModel.getOnboardingStatusForProject(projectId);
        if (!onboardingStatus) {
            throw new error_1.NotFoundError(`No project with id "${projectId}" exists.`);
        }
        const formatEvents = (recentEvents) => recentEvents.map((event) => ({
            createdAt: event.createdAt,
            summary: this.featureEventFormatter.format(event).text,
            createdBy: event.createdBy,
            id: event.id,
            createdByImageUrl: (0, util_1.generateImageUrl)({ email: event.createdBy }),
        }));
        const filterRoles = (allRoles) => allRoles
            .filter((role) => ['project', 'custom'].includes(role.type))
            .map((role) => ({
            id: role.id,
            name: role.name,
            type: role.type,
        }));
        const [latestEvents, owners, roles, healthScores] = await Promise.all([
            this.eventStore
                .searchEvents({ limit: 10, offset: 0 }, [
                {
                    field: 'project',
                    operator: 'IS',
                    values: [projectId],
                },
            ])
                .then(formatEvents),
            this.projectOwnersReadModel.getProjectOwners(projectId),
            this.accessStore
                .getAllProjectRolesForUser(userId, projectId)
                .then(filterRoles),
            this.personalDashboardReadModel.getLatestHealthScores(projectId, 8),
        ]);
        let avgHealthCurrentWindow = null;
        let avgHealthPastWindow = null;
        if (healthScores.length >= 4) {
            avgHealthCurrentWindow = Math.round(healthScores
                .slice(0, 4)
                .reduce((acc, score) => acc + score, 0) / 4);
        }
        if (healthScores.length >= 8) {
            avgHealthPastWindow = Math.round(healthScores
                .slice(4, 8)
                .reduce((acc, score) => acc + score, 0) / 4);
        }
        const [projectInsights] = await this.projectReadModel.getProjectsForInsights({
            id: projectId,
        });
        const totalFlags = projectInsights?.featureCount || 0;
        const potentiallyStaleFlags = projectInsights?.potentiallyStaleFeatureCount || 0;
        const staleFlags = projectInsights?.staleFeatureCount || 0;
        const currentHealth = projectInsights?.health || 0;
        return {
            latestEvents,
            onboardingStatus,
            owners,
            roles,
            insights: {
                avgHealthCurrentWindow,
                avgHealthPastWindow,
                totalFlags,
                potentiallyStaleFlags,
                staleFlags,
                activeFlags: totalFlags - staleFlags - potentiallyStaleFlags,
                health: currentHealth,
            },
        };
    }
    async getAdmins() {
        return this.accountStore.getAdmins();
    }
}
exports.PersonalDashboardService = PersonalDashboardService;
//# sourceMappingURL=personal-dashboard-service.js.map