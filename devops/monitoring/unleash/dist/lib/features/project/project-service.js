"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
const joi_1 = require("joi");
const slug_1 = __importDefault(require("slug"));
const name_exists_error_1 = __importDefault(require("../../error/name-exists-error"));
const invalid_operation_error_1 = __importDefault(require("../../error/invalid-operation-error"));
const util_1 = require("../../routes/util");
const project_schema_1 = require("../../services/project-schema");
const notfound_error_1 = __importDefault(require("../../error/notfound-error"));
const types_1 = require("../../types");
const incompatible_project_error_1 = __importDefault(require("../../error/incompatible-project-error"));
const util_2 = require("../../util");
const time_to_production_1 = require("../feature-toggle/time-to-production/time-to-production");
const unique_1 = require("../../util/unique");
const error_1 = require("../../error");
const feature_naming_validation_1 = require("../feature-naming-pattern/feature-naming-validation");
const exceeds_limit_error_1 = require("../../error/exceeds-limit-error");
const can_grant_project_role_1 = require("./can-grant-project-role");
function includes(list, { id, }) {
    return list.some((l) => l === id);
}
class ProjectService {
    constructor({ projectStore, projectOwnersReadModel, projectFlagCreatorsReadModel, eventStore, featureToggleStore, environmentStore, featureEnvironmentStore, accountStore, projectStatsStore, projectReadModel, onboardingReadModel, }, config, accessService, featureToggleService, groupService, favoriteService, eventService, privateProjectChecker, apiTokenService) {
        this.validateAndProcessFeatureNamingPattern = (featureNaming) => {
            const validationResult = (0, feature_naming_validation_1.checkFeatureNamingData)(featureNaming);
            if (validationResult.state === 'invalid') {
                const [firstReason, ...remainingReasons] = validationResult.reasons.map((message) => ({
                    message,
                }));
                throw new error_1.BadDataError('The feature naming pattern data you provided was invalid.', [firstReason, ...remainingReasons]);
            }
            if (featureNaming.pattern && !featureNaming.example) {
                featureNaming.example = null;
            }
            if (featureNaming.pattern && !featureNaming.description) {
                featureNaming.description = null;
            }
            return featureNaming;
        };
        this.projectStore = projectStore;
        this.projectOwnersReadModel = projectOwnersReadModel;
        this.projectFlagCreatorsReadModel = projectFlagCreatorsReadModel;
        this.environmentStore = environmentStore;
        this.featureEnvironmentStore = featureEnvironmentStore;
        this.accessService = accessService;
        this.eventStore = eventStore;
        this.featureToggleStore = featureToggleStore;
        this.apiTokenService = apiTokenService;
        this.featureToggleService = featureToggleService;
        this.favoritesService = favoriteService;
        this.privateProjectChecker = privateProjectChecker;
        this.accountStore = accountStore;
        this.groupService = groupService;
        this.eventService = eventService;
        this.projectStatsStore = projectStatsStore;
        this.logger = config.getLogger('services/project-service.js');
        this.flagResolver = config.flagResolver;
        this.isEnterprise = config.isEnterprise;
        this.resourceLimits = config.resourceLimits;
        this.eventBus = config.eventBus;
        this.projectReadModel = projectReadModel;
        this.onboardingReadModel = onboardingReadModel;
    }
    async getProjects(query, userId) {
        const projects = await this.projectReadModel.getProjectsForAdminUi(query, userId);
        if (userId) {
            const projectAccess = await this.privateProjectChecker.getUserAccessibleProjects(userId);
            if (projectAccess.mode === 'all') {
                return projects;
            }
            else {
                return projects.filter((project) => projectAccess.projects.includes(project.id));
            }
        }
        return projects;
    }
    async addOwnersToProjects(projects) {
        return this.projectOwnersReadModel.addOwners(projects);
    }
    async getProject(id) {
        const project = await this.projectStore.get(id);
        if (project === undefined) {
            throw new notfound_error_1.default(`Could not find project with id ${id}`);
        }
        return Promise.resolve(project);
    }
    async validateEnvironmentsExist(environments) {
        const projectsAndExistence = await Promise.all(environments.map(async (env) => [
            env,
            await this.environmentStore.exists(env),
        ]));
        const invalidEnvs = projectsAndExistence
            .filter(([_, exists]) => !exists)
            .map(([env]) => env);
        if (invalidEnvs.length > 0) {
            throw new error_1.BadDataError(`These environments do not exist: ${invalidEnvs
                .map((env) => `'${env}'`)
                .join(', ')}.`);
        }
    }
    async validateProjectEnvironments(environments) {
        if (environments) {
            await this.validateEnvironmentsExist(environments);
        }
    }
    async validateProjectLimit() {
        const limit = Math.max(this.resourceLimits.projects, 1);
        const projectCount = await this.projectStore.count();
        if (projectCount >= limit) {
            (0, exceeds_limit_error_1.throwExceedsLimitError)(this.eventBus, {
                resource: 'project',
                limit,
            });
        }
    }
    async generateProjectId(name) {
        const slug = (0, slug_1.default)(name).slice(0, 90);
        const generateUniqueId = async (suffix) => {
            const id = suffix ? `${slug}-${suffix}` : slug;
            if (await this.projectStore.hasProject(id)) {
                return await generateUniqueId((suffix ?? 0) + 1);
            }
            else {
                return id;
            }
        };
        return generateUniqueId();
    }
    async createProject(newProject, user, auditUser, enableChangeRequestsForSpecifiedEnvironments = async () => {
        return [];
    }) {
        await this.validateProjectLimit();
        const validateData = async () => {
            await this.validateProjectEnvironments(newProject.environments);
            if (!newProject.id?.trim()) {
                newProject.id = await this.generateProjectId(newProject.name);
                return await project_schema_1.projectSchema.validateAsync(newProject);
            }
            else {
                const validatedData = await project_schema_1.projectSchema.validateAsync(newProject);
                await this.validateUniqueId(validatedData.id);
                return validatedData;
            }
        };
        const validatedData = await validateData();
        const data = this.removePropertiesForNonEnterprise(validatedData);
        await this.projectStore.create(data);
        const envsToEnable = newProject.environments
            ? newProject.environments
            : (await this.environmentStore.getAll({
                enabled: true,
            })).map((env) => env.name);
        await Promise.all(envsToEnable.map(async (env) => {
            await this.featureEnvironmentStore.connectProject(env, data.id);
        }));
        if (this.isEnterprise) {
            if (newProject.changeRequestEnvironments) {
                await this.validateEnvironmentsExist(newProject.changeRequestEnvironments.map((env) => env.name));
                const changeRequestEnvironments = await enableChangeRequestsForSpecifiedEnvironments(newProject.changeRequestEnvironments);
                data.changeRequestEnvironments = changeRequestEnvironments;
            }
            else {
                data.changeRequestEnvironments = [];
            }
        }
        await this.accessService.createDefaultProjectRoles(user, data.id);
        await this.eventService.storeEvent(new types_1.ProjectCreatedEvent({
            data,
            project: data.id,
            auditUser,
        }));
        return { ...data, environments: envsToEnable };
    }
    async updateProject(updatedProject, auditUser) {
        const preData = await this.projectStore.get(updatedProject.id);
        await this.projectStore.update(updatedProject);
        // updated project contains instructions to update the project but it may not represent a whole project
        const afterData = await this.projectStore.get(updatedProject.id);
        await this.eventService.storeEvent(new types_1.ProjectUpdatedEvent({
            project: updatedProject.id,
            data: afterData,
            preData,
            auditUser,
        }));
    }
    async updateProjectEnterpriseSettings(updatedProject, auditUser) {
        const preData = await this.projectStore.get(updatedProject.id);
        if (updatedProject.featureNaming) {
            this.validateAndProcessFeatureNamingPattern(updatedProject.featureNaming);
        }
        await this.projectStore.updateProjectEnterpriseSettings(updatedProject);
        await this.eventService.storeEvent(new types_1.ProjectUpdatedEvent({
            project: updatedProject.id,
            data: { ...preData, ...updatedProject },
            preData,
            auditUser,
        }));
    }
    async checkProjectsCompatibility(feature, newProjectId) {
        const featureEnvs = await this.featureEnvironmentStore.getAll({
            feature_name: feature.name,
        });
        const newEnvs = await this.projectStore.getEnvironmentsForProject(newProjectId);
        return (0, util_2.arraysHaveSameItems)(featureEnvs.map((env) => env.environment), newEnvs.map((projectEnv) => projectEnv.environment));
    }
    async addEnvironmentToProject(project, environment) {
        await this.projectStore.addEnvironmentToProject(project, environment);
    }
    async validateActiveProject(projectId) {
        const hasActiveProject = await this.projectStore.hasActiveProject(projectId);
        if (!hasActiveProject) {
            throw new notfound_error_1.default(`Active project with id ${projectId} does not exist`);
        }
    }
    async changeProject(newProjectId, featureName, user, currentProjectId, auditUser) {
        const feature = await this.featureToggleStore.get(featureName);
        if (feature === undefined) {
            throw new notfound_error_1.default(`Could not find feature ${featureName}`);
        }
        if (feature.project !== currentProjectId) {
            throw new error_1.PermissionError(types_1.MOVE_FEATURE_TOGGLE);
        }
        await this.validateActiveProject(newProjectId);
        const authorized = await this.accessService.hasPermission(user, types_1.MOVE_FEATURE_TOGGLE, newProjectId);
        if (!authorized) {
            throw new error_1.PermissionError(types_1.MOVE_FEATURE_TOGGLE);
        }
        const isCompatibleWithTargetProject = await this.checkProjectsCompatibility(feature, newProjectId);
        if (!isCompatibleWithTargetProject) {
            throw new incompatible_project_error_1.default(newProjectId);
        }
        const updatedFeature = await this.featureToggleService.changeProject(featureName, newProjectId, auditUser);
        await this.featureToggleService.updateFeatureStrategyProject(featureName, newProjectId);
        return updatedFeature;
    }
    async deleteProject(id, user, auditUser) {
        if (id === types_1.DEFAULT_PROJECT) {
            throw new invalid_operation_error_1.default('You can not delete the default project!');
        }
        const flags = await this.featureToggleStore.getAll({
            project: id,
            archived: false,
        });
        if (flags.length > 0) {
            throw new invalid_operation_error_1.default('You can not delete a project with active feature flags');
        }
        const archivedFlags = await this.featureToggleStore.getAll({
            project: id,
            archived: true,
        });
        await this.featureToggleService.deleteFeatures(archivedFlags.map((flag) => flag.name), id, auditUser);
        const allTokens = await this.apiTokenService.getAllTokens();
        const projectTokens = allTokens.filter((token) => (token.projects &&
            token.projects.length === 1 &&
            token.projects[0] === id) ||
            token.project === id);
        await this.projectStore.delete(id);
        await Promise.all(projectTokens.map((token) => this.apiTokenService.delete(token.secret, auditUser)));
        await this.eventService.storeEvent(new types_1.ProjectDeletedEvent({
            project: id,
            auditUser,
        }));
        await this.accessService.removeDefaultProjectRoles(user, id);
    }
    async archiveProject(id, auditUser) {
        const flags = await this.featureToggleStore.getAll({
            project: id,
            archived: false,
        });
        // TODO: allow archiving project with unused flags
        if (flags.length > 0) {
            throw new invalid_operation_error_1.default('You can not archive a project with active feature flags');
        }
        await this.projectStore.archive(id);
        await this.eventService.storeEvent(new types_1.ProjectArchivedEvent({
            project: id,
            auditUser,
        }));
    }
    async reviveProject(id, auditUser) {
        await this.validateProjectLimit();
        await this.projectStore.revive(id);
        await this.eventService.storeEvent(new types_1.ProjectRevivedEvent({
            project: id,
            auditUser,
        }));
    }
    async validateId(id) {
        await util_1.nameType.validateAsync(id);
        await this.validateUniqueId(id);
        return true;
    }
    async validateUniqueId(id) {
        const exists = await this.projectStore.hasProject(id);
        if (exists) {
            throw new name_exists_error_1.default('A project with this id already exists.');
        }
    }
    // RBAC methods
    async getAccessToProject(projectId) {
        return this.accessService.getProjectRoleAccess(projectId);
    }
    /**
     * @deprecated use removeUserAccess
     */
    async removeUser(projectId, roleId, userId, auditUser) {
        const role = await this.findProjectRole(projectId, roleId);
        await this.accessService.removeUserFromRole(userId, role.id, projectId);
        const user = await this.accountStore.get(userId);
        await this.eventService.storeEvent(new types_1.ProjectUserRemovedEvent({
            project: projectId,
            auditUser,
            preData: {
                roleId,
                userId,
                roleName: role.name,
                email: user?.email,
            },
        }));
    }
    async removeUserAccess(projectId, userId, auditUser) {
        const existingRoles = await this.accessService.getProjectRolesForUser(projectId, userId);
        await this.accessService.removeUserAccess(projectId, userId);
        await this.eventService.storeEvent(new types_1.ProjectAccessUserRolesDeleted({
            project: projectId,
            auditUser,
            preData: {
                roles: existingRoles,
                userId,
            },
        }));
    }
    async removeGroupAccess(projectId, groupId, auditUser) {
        const existingRoles = await this.accessService.getProjectRolesForGroup(projectId, groupId);
        await this.accessService.removeGroupAccess(projectId, groupId);
        await this.eventService.storeEvent(new types_1.ProjectAccessUserRolesDeleted({
            project: projectId,
            auditUser,
            preData: {
                roles: existingRoles,
                groupId,
            },
        }));
    }
    async addGroup(projectId, roleId, groupId, auditUser) {
        const role = await this.accessService.getRole(roleId);
        const group = await this.groupService.getGroup(groupId);
        const project = await this.getProject(projectId);
        if (group.id == null)
            throw new joi_1.ValidationError('Unexpected empty group id', [], undefined);
        await this.accessService.addGroupToRole(group.id, role.id, auditUser.username, project.id);
        await this.eventService.storeEvent(new types_1.ProjectGroupAddedEvent({
            project: project.id,
            auditUser,
            data: {
                groupId: group.id,
                projectId: project.id,
                roleName: role.name,
            },
        }));
    }
    /**
     * @deprecated use removeGroupAccess
     */
    async removeGroup(projectId, roleId, groupId, auditUser) {
        const group = await this.groupService.getGroup(groupId);
        const role = await this.accessService.getRole(roleId);
        const project = await this.getProject(projectId);
        if (group.id == null)
            throw new joi_1.ValidationError('Unexpected empty group id', [], undefined);
        await this.accessService.removeGroupFromRole(group.id, role.id, project.id);
        await this.eventService.storeEvent(new types_1.ProjectGroupRemovedEvent({
            project: projectId,
            auditUser,
            preData: {
                groupId: group.id,
                projectId: project.id,
                roleName: role.name,
            },
        }));
    }
    async addRoleAccess(projectId, roleId, usersAndGroups, auditUser) {
        await this.accessService.addRoleAccessToProject(usersAndGroups.users, usersAndGroups.groups, projectId, roleId, auditUser);
        await this.eventService.storeEvent(new types_1.ProjectAccessAddedEvent({
            project: projectId,
            auditUser,
            data: {
                roles: {
                    roleId,
                    groupIds: usersAndGroups.groups.map(({ id }) => id),
                    userIds: usersAndGroups.users.map(({ id }) => id),
                },
            },
        }));
    }
    isAdmin(userId, roles) {
        return (userId === types_1.SYSTEM_USER_ID ||
            userId === types_1.ADMIN_TOKEN_USER.id ||
            roles.some((r) => r.name === types_1.RoleName.ADMIN));
    }
    isProjectOwner(roles, project) {
        return roles.some((r) => r.project === project && r.name === types_1.RoleName.OWNER);
    }
    async isAllowedToAddAccess(userAddingAccess, projectId, rolesBeingAdded) {
        const userPermissions = await this.accessService.getPermissionsForUser(userAddingAccess);
        if (userPermissions.some(({ permission }) => permission === types_1.ADMIN)) {
            return true;
        }
        const userRoles = await this.accessService.getAllProjectRolesForUser(userAddingAccess.id, projectId);
        if (this.isAdmin(userAddingAccess.id, userRoles) ||
            this.isProjectOwner(userRoles, projectId)) {
            return true;
        }
        // Users may have access to multiple projects, so we need to filter out the permissions based on this project.
        // Since the project roles are just collections of permissions that are not tied to a project in the database
        // not filtering here might lead to false positives as they may have the permission in another project.
        if (this.flagResolver.isEnabled('projectRoleAssignment')) {
            const filteredUserPermissions = userPermissions.filter((permission) => permission.project === projectId);
            const rolesToBeAssignedData = await Promise.all(rolesBeingAdded.map((role) => this.accessService.getRole(role)));
            const rolesToBeAssignedPermissions = rolesToBeAssignedData.flatMap((role) => role.permissions);
            return (0, can_grant_project_role_1.canGrantProjectRole)(filteredUserPermissions, rolesToBeAssignedPermissions);
        }
        else {
            return rolesBeingAdded.every((roleId) => userRoles.some((userRole) => userRole.id === roleId));
        }
    }
    async addAccess(projectId, roles, groups, users, auditUser) {
        if (await this.isAllowedToAddAccess(auditUser, projectId, roles)) {
            await this.accessService.addAccessToProject(roles, groups, users, projectId, auditUser.username);
            await this.eventService.storeEvent(new types_1.ProjectAccessAddedEvent({
                project: projectId,
                auditUser,
                data: {
                    roles: roles.map((roleId) => {
                        return {
                            roleId,
                            groupIds: groups,
                            userIds: users,
                        };
                    }),
                },
            }));
        }
        else {
            throw new invalid_operation_error_1.default('User tried to grant role they did not have access to');
        }
    }
    async setRolesForUser(projectId, userId, newRoles, auditUser) {
        const currentRoles = await this.accessService.getProjectRolesForUser(projectId, userId);
        const isAllowedToAssignRoles = await this.isAllowedToAddAccess(auditUser, projectId, newRoles);
        if (isAllowedToAssignRoles) {
            await this.accessService.setProjectRolesForUser(projectId, userId, newRoles);
            await this.eventService.storeEvent(new types_1.ProjectAccessUserRolesUpdated({
                project: projectId,
                auditUser,
                data: {
                    roles: newRoles,
                    userId,
                },
                preData: {
                    roles: currentRoles,
                    userId,
                },
            }));
        }
        else {
            throw new invalid_operation_error_1.default('User tried to assign a role they did not have access to');
        }
    }
    async setRolesForGroup(projectId, groupId, newRoles, auditUser) {
        const currentRoles = await this.accessService.getProjectRolesForGroup(projectId, groupId);
        const isAllowedToAssignRoles = await this.isAllowedToAddAccess(auditUser, projectId, newRoles);
        if (isAllowedToAssignRoles) {
            await this.accessService.setProjectRolesForGroup(projectId, groupId, newRoles, auditUser.username);
            await this.eventService.storeEvent(new types_1.ProjectAccessGroupRolesUpdated({
                project: projectId,
                auditUser,
                data: {
                    roles: newRoles,
                    groupId,
                },
                preData: {
                    roles: currentRoles,
                    groupId,
                },
            }));
        }
        else {
            throw new invalid_operation_error_1.default('User tried to assign a role they did not have access to');
        }
    }
    async findProjectGroupRole(projectId, roleId) {
        const roles = await this.groupService.getRolesForProject(projectId);
        const role = roles.find((r) => r.roleId === roleId);
        if (!role) {
            throw new notfound_error_1.default(`Couldn't find roleId=${roleId} on project=${projectId}`);
        }
        return role;
    }
    async findProjectRole(projectId, roleId) {
        const roles = await this.accessService.getRolesForProject(projectId);
        const role = roles.find((r) => r.id === roleId);
        if (!role) {
            throw new notfound_error_1.default(`Couldn't find roleId=${roleId} on project=${projectId}`);
        }
        return role;
    }
    /** @deprecated use projectInsightsService instead */
    async getDoraMetrics(projectId) {
        const activeFeatureFlags = (await this.featureToggleStore.getAll({ project: projectId })).map((feature) => feature.name);
        const archivedFeatureFlags = (await this.featureToggleStore.getAll({
            project: projectId,
            archived: true,
        })).map((feature) => feature.name);
        const featureFlagNames = [
            ...activeFeatureFlags,
            ...archivedFeatureFlags,
        ];
        const projectAverage = (0, time_to_production_1.calculateAverageTimeToProd)(await this.projectStatsStore.getTimeToProdDates(projectId));
        const flagAverage = await this.projectStatsStore.getTimeToProdDatesForFeatureToggles(projectId, featureFlagNames);
        return {
            features: flagAverage,
            projectAverage: projectAverage,
        };
    }
    async getApplications(searchParams) {
        const applications = await this.projectStore.getApplicationsByProject({
            ...searchParams,
            sortBy: searchParams.sortBy || 'appName',
        });
        return applications;
    }
    async getProjectFlagCreators(projectId) {
        return this.projectFlagCreatorsReadModel.getFlagCreators(projectId);
    }
    async changeRole(projectId, roleId, userId, auditUser) {
        const usersWithRoles = await this.getAccessToProject(projectId);
        const user = usersWithRoles.users.find((u) => u.id === userId);
        if (!user)
            throw new joi_1.ValidationError('Unexpected empty user', [], undefined);
        const currentRole = usersWithRoles.roles.find((r) => r.id === user.roleId);
        if (!currentRole)
            throw new joi_1.ValidationError('Unexpected empty current role', [], undefined);
        if (currentRole.id === roleId) {
            // Nothing to do....
            return;
        }
        await this.accessService.updateUserProjectRole(userId, roleId, projectId);
        const role = await this.findProjectRole(projectId, roleId);
        await this.eventService.storeEvent(new types_1.ProjectUserUpdateRoleEvent({
            project: projectId,
            auditUser,
            preData: {
                userId,
                roleId: currentRole.id,
                roleName: currentRole.name,
                email: user.email,
            },
            data: {
                userId,
                roleId,
                roleName: role.name,
                email: user.email,
            },
        }));
    }
    async changeGroupRole(projectId, roleId, userId, auditUser) {
        const usersWithRoles = await this.getAccessToProject(projectId);
        const userGroup = usersWithRoles.groups.find((u) => u.id === userId);
        if (!userGroup)
            throw new joi_1.ValidationError('Unexpected empty user', [], undefined);
        const currentRole = usersWithRoles.roles.find((r) => userGroup.roles?.includes(r.id));
        if (!currentRole)
            throw new joi_1.ValidationError('Unexpected empty current role', [], undefined);
        if (currentRole.id === roleId) {
            // Nothing to do....
            return;
        }
        await this.accessService.updateGroupProjectRole(userId, roleId, projectId);
        const role = await this.findProjectGroupRole(projectId, roleId);
        await this.eventService.storeEvent(new types_1.ProjectGroupUpdateRoleEvent({
            project: projectId,
            auditUser,
            preData: {
                userId,
                roleId: currentRole.id,
                roleName: currentRole.name,
            },
            data: {
                userId,
                roleId,
                roleName: role.name,
            },
        }));
    }
    async getMembers(projectId) {
        return this.projectStore.getMembersCountByProject(projectId);
    }
    async getProjectUsers(projectId) {
        const { groups, users } = await this.accessService.getProjectRoleAccess(projectId);
        const actualUsers = users.map((user) => ({
            id: user.id,
            email: user.email,
            username: user.username,
        }));
        const actualGroupUsers = groups
            .flatMap((group) => group.users)
            .map((user) => user.user)
            .map((user) => ({
            id: user.id,
            email: user.email,
            username: user.username,
        }));
        return (0, unique_1.uniqueByKey)([...actualUsers, ...actualGroupUsers], 'id');
    }
    async isProjectUser(userId, projectId) {
        const users = await this.getProjectUsers(projectId);
        return Boolean(users.find((user) => user.id === userId));
    }
    async getProjectsByUser(userId) {
        return this.projectReadModel.getProjectsByUser(userId);
    }
    async getProjectRoleUsage(roleId) {
        return this.accessService.getProjectRoleUsage(roleId);
    }
    async statusJob() {
        const projects = await this.projectStore.getAll();
        const statusUpdates = await Promise.all(projects.map((project) => this.getStatusUpdates(project.id)));
        await Promise.all(statusUpdates.map((statusUpdate) => {
            return this.projectStatsStore.updateProjectStats(statusUpdate.projectId, statusUpdate.updates);
        }));
    }
    async getStatusUpdates(projectId) {
        const dateMinusThirtyDays = (0, date_fns_1.subDays)(new Date(), 30).toISOString();
        const dateMinusSixtyDays = (0, date_fns_1.subDays)(new Date(), 60).toISOString();
        const [createdCurrentWindow, createdPastWindow, archivedCurrentWindow, archivedPastWindow,] = await Promise.all([
            await this.featureToggleStore.countByDate({
                project: projectId,
                dateAccessor: 'created_at',
                date: dateMinusThirtyDays,
            }),
            await this.featureToggleStore.countByDate({
                project: projectId,
                dateAccessor: 'created_at',
                range: [dateMinusSixtyDays, dateMinusThirtyDays],
            }),
            await this.featureToggleStore.countByDate({
                project: projectId,
                archived: true,
                dateAccessor: 'archived_at',
                date: dateMinusThirtyDays,
            }),
            await this.featureToggleStore.countByDate({
                project: projectId,
                archived: true,
                dateAccessor: 'archived_at',
                range: [dateMinusSixtyDays, dateMinusThirtyDays],
            }),
        ]);
        const [projectActivityCurrentWindow, projectActivityPastWindow] = await Promise.all([
            this.eventStore.queryCount([
                {
                    op: 'where',
                    parameters: { project: projectId },
                },
                {
                    op: 'beforeDate',
                    parameters: {
                        dateAccessor: 'created_at',
                        date: dateMinusThirtyDays,
                    },
                },
            ]),
            this.eventStore.queryCount([
                {
                    op: 'where',
                    parameters: { project: projectId },
                },
                {
                    op: 'betweenDate',
                    parameters: {
                        dateAccessor: 'created_at',
                        range: [dateMinusSixtyDays, dateMinusThirtyDays],
                    },
                },
            ]),
        ]);
        const avgTimeToProdCurrentWindow = (0, time_to_production_1.calculateAverageTimeToProd)(await this.projectStatsStore.getTimeToProdDates(projectId));
        const projectMembersAddedCurrentWindow = await this.projectStore.getMembersCountByProjectAfterDate(projectId, dateMinusThirtyDays);
        return {
            projectId,
            updates: {
                avgTimeToProdCurrentWindow,
                createdCurrentWindow,
                createdPastWindow,
                archivedCurrentWindow,
                archivedPastWindow,
                projectActivityCurrentWindow,
                projectActivityPastWindow,
                projectMembersAddedCurrentWindow,
            },
        };
    }
    async getProjectHealth(projectId, archived = false, userId) {
        const [project, environments, features, members, favorite, projectStats,] = await Promise.all([
            this.projectStore.get(projectId),
            this.projectStore.getEnvironmentsForProject(projectId),
            this.featureToggleService.getFeatureOverview({
                projectId,
                archived,
                userId,
            }),
            this.projectStore.getMembersCountByProject(projectId),
            userId
                ? this.favoritesService.isFavoriteProject({
                    project: projectId,
                    userId,
                })
                : Promise.resolve(false),
            this.projectStatsStore.getProjectStats(projectId),
        ]);
        if (project === undefined) {
            throw new notfound_error_1.default(`Could not find project with id ${projectId}`);
        }
        return {
            stats: projectStats,
            name: project.name,
            description: project.description,
            mode: project.mode,
            featureLimit: project.featureLimit,
            featureNaming: project.featureNaming,
            defaultStickiness: project.defaultStickiness,
            health: project.health || 0,
            favorite: favorite,
            updatedAt: project.updatedAt,
            createdAt: project.createdAt,
            environments,
            features: features,
            members,
            version: 1,
        };
    }
    async getProjectOverview(projectId, archived = false, userId) {
        const [project, environments, featureTypeCounts, members, favorite, projectStats, onboardingStatus,] = await Promise.all([
            this.projectStore.get(projectId),
            this.projectStore.getEnvironmentsForProject(projectId),
            this.featureToggleService.getFeatureTypeCounts({
                projectId,
                archived,
                userId,
            }),
            this.projectStore.getMembersCountByProject(projectId),
            userId
                ? this.favoritesService.isFavoriteProject({
                    project: projectId,
                    userId,
                })
                : Promise.resolve(false),
            this.projectStatsStore.getProjectStats(projectId),
            this.onboardingReadModel.getOnboardingStatusForProject(projectId),
        ]);
        if (project === undefined) {
            throw new notfound_error_1.default(`Could not find project with id: ${projectId}`);
        }
        return {
            stats: projectStats,
            name: project.name,
            description: project.description,
            mode: project.mode,
            featureLimit: project.featureLimit,
            featureNaming: project.featureNaming,
            defaultStickiness: project.defaultStickiness,
            health: project.health || 0,
            favorite: favorite,
            updatedAt: project.updatedAt,
            archivedAt: project.archivedAt,
            createdAt: project.createdAt,
            onboardingStatus: onboardingStatus ?? {
                status: 'onboarding-started',
            },
            environments,
            featureTypeCounts,
            members,
            version: 1,
        };
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    removePropertiesForNonEnterprise(data) {
        if (this.isEnterprise) {
            return data;
        }
        const { mode, changeRequestEnvironments, ...proData } = data;
        return proData;
    }
}
exports.default = ProjectService;
//# sourceMappingURL=project-service.js.map