"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
const error_1 = require("../../error");
const name_exists_error_1 = __importDefault(require("../../error/name-exists-error"));
const sort_order_schema_1 = require("../../services/sort-order-schema");
const notfound_error_1 = __importDefault(require("../../error/notfound-error"));
class EnvironmentService {
    constructor({ environmentStore, featureStrategiesStore, featureEnvironmentStore, projectStore, }, { getLogger, flagResolver, }, eventService) {
        this.logger = getLogger('services/environment-service.ts');
        this.environmentStore = environmentStore;
        this.featureStrategiesStore = featureStrategiesStore;
        this.featureEnvironmentStore = featureEnvironmentStore;
        this.projectStore = projectStore;
        this.eventService = eventService;
        this.flagResolver = flagResolver;
    }
    async getAll() {
        return this.environmentStore.getAllWithCounts();
    }
    async get(name) {
        const env = await this.environmentStore.get(name);
        if (env === undefined) {
            throw new notfound_error_1.default(`Could not find environment with name ${name}`);
        }
        return env;
    }
    async getProjectEnvironments(projectId) {
        // This function produces an object for every environment, in that object is a boolean
        // describing whether that environment is enabled - aka not deprecated
        const environments = await this.projectStore.getEnvironmentsForProject(projectId);
        const environmentsOnProject = new Set(environments.map((env) => env.environment));
        const allEnvironments = await this.environmentStore.getProjectEnvironments(projectId);
        return allEnvironments.map((env) => {
            return {
                ...env,
                visible: environmentsOnProject.has(env.name),
            };
        });
    }
    async updateSortOrder(sortOrder) {
        await sort_order_schema_1.sortOrderSchema.validateAsync(sortOrder);
        await Promise.all(Object.keys(sortOrder).map((key) => {
            const value = sortOrder[key];
            return this.environmentStore.updateSortOrder(key, value);
        }));
    }
    async toggleEnvironment(name, value) {
        const exists = await this.environmentStore.exists(name);
        if (exists) {
            return this.environmentStore.toggle(name, value);
        }
        throw new notfound_error_1.default(`Could not find environment ${name}`);
    }
    async addEnvironmentToProject(environment, projectId, auditUser) {
        try {
            await this.featureEnvironmentStore.connectProject(environment, projectId);
            await this.featureEnvironmentStore.connectFeatures(environment, projectId);
            await this.eventService.storeEvent(new types_1.ProjectEnvironmentAdded({
                project: projectId,
                environment,
                auditUser,
            }));
        }
        catch (e) {
            if (e.code === error_1.UNIQUE_CONSTRAINT_VIOLATION) {
                throw new name_exists_error_1.default(`${projectId} already has the environment ${environment} enabled`);
            }
            throw e;
        }
    }
    async updateDefaultStrategy(environment, projectId, strategy, auditUser) {
        if (strategy.name !== 'flexibleRollout') {
            throw new error_1.BadDataError('Only "flexibleRollout" strategy can be used as a default strategy for an environment');
        }
        const previousDefaultStrategy = await this.projectStore.getDefaultStrategy(projectId, environment);
        const defaultStrategy = await this.projectStore.updateDefaultStrategy(projectId, environment, strategy);
        await this.eventService.storeEvent(new types_1.DefaultStrategyUpdatedEvent({
            project: projectId,
            environment,
            preData: previousDefaultStrategy,
            data: defaultStrategy,
            auditUser,
        }));
        return defaultStrategy;
    }
    async overrideEnabledProjects(environmentNamesToEnable) {
        if (environmentNamesToEnable.length === 0) {
            return Promise.resolve();
        }
        const allEnvironments = await this.environmentStore.getAll();
        const existingEnvironmentsToEnable = allEnvironments.filter((env) => environmentNamesToEnable.includes(env.name));
        if (existingEnvironmentsToEnable.length !==
            environmentNamesToEnable.length) {
            this.logger.warn("Found environment enabled overrides but some of the specified environments don't exist, no overrides will be executed");
            return Promise.resolve();
        }
        const environmentsNotAlreadyEnabled = existingEnvironmentsToEnable.filter((env) => !env.enabled);
        const environmentsToDisable = allEnvironments.filter((env) => {
            return !environmentNamesToEnable.includes(env.name) && env.enabled;
        });
        await this.environmentStore.disable(environmentsToDisable);
        await this.environmentStore.enable(environmentsNotAlreadyEnabled);
        await this.remapProjectsLinks(environmentsToDisable, environmentsNotAlreadyEnabled);
    }
    async remapProjectsLinks(toDisable, toEnable) {
        const projectLinks = await this.projectStore.getProjectLinksForEnvironments(toDisable.map((env) => env.name));
        const unlinkTasks = projectLinks.map((link) => {
            return this.forceRemoveEnvironmentFromProject(link.environmentName, link.projectId);
        });
        await Promise.all(unlinkTasks.flat());
        const uniqueProjects = [
            ...new Set(projectLinks.map((link) => link.projectId)),
        ];
        const linkTasks = uniqueProjects.flatMap((project) => {
            return toEnable.map((enabledEnv) => {
                return this.addEnvironmentToProject(enabledEnv.name, project, types_1.SYSTEM_USER_AUDIT);
            });
        });
        await Promise.all(linkTasks);
    }
    async forceRemoveEnvironmentFromProject(environment, projectId) {
        await this.featureEnvironmentStore.disconnectFeatures(environment, projectId);
        await this.featureEnvironmentStore.disconnectProject(environment, projectId);
    }
    async removeEnvironmentFromProject(environment, projectId, auditUser) {
        const projectEnvs = await this.projectStore.getEnvironmentsForProject(projectId);
        await this.forceRemoveEnvironmentFromProject(environment, projectId);
        await this.eventService.storeEvent(new types_1.ProjectEnvironmentRemoved({
            project: projectId,
            environment,
            auditUser,
        }));
    }
}
exports.default = EnvironmentService;
//# sourceMappingURL=environment-service.js.map