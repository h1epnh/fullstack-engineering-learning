"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findParam = findParam;
const permissions_1 = require("../types/permissions");
const util_1 = require("../util");
function findParam(name, { params, body }, defaultValue) {
    let found = params ? params[name] : undefined;
    if (found === undefined) {
        found = body ? body[name] : undefined;
    }
    return found || defaultValue;
}
const rbacMiddleware = (config, { featureToggleStore, segmentStore, }, accessService) => {
    const logger = config.getLogger('/middleware/rbac-middleware.ts');
    logger.debug('Enabling RBAC middleware');
    return (req, res, next) => {
        req.checkRbac = async (permissions) => {
            const permissionsArray = Array.isArray(permissions)
                ? permissions
                : [permissions];
            const { user, params } = req;
            if (!user) {
                logger.error('RBAC requires a user to exist on the request.');
                return false;
            }
            if (user.isAPI) {
                if (user.permissions.includes(permissions_1.ADMIN)) {
                    if (!req.user.id) {
                        req.user.id = (0, util_1.extractUserId)(req);
                    }
                    return true;
                }
                else {
                    return false;
                }
            }
            if (!user.id) {
                logger.error('RBAC requires the user to have a unique id.');
                return false;
            }
            let projectId = findParam('projectId', req) || findParam('project', req);
            const environment = findParam('environment', req) ||
                findParam('environmentId', req);
            // Temporary workaround to figure out projectId for feature flag updates.
            // will be removed in Unleash v5.0
            if (!projectId &&
                permissionsArray.some((permission) => [permissions_1.DELETE_FEATURE, permissions_1.UPDATE_FEATURE].includes(permission))) {
                const { featureName } = params;
                projectId = await featureToggleStore.getProjectId(featureName);
            }
            else if (projectId === undefined &&
                permissionsArray.some((permission) => permission === permissions_1.CREATE_FEATURE ||
                    permission.endsWith('FEATURE_STRATEGY'))) {
                projectId = 'default';
            }
            if (config.isOss) {
                if (projectId !== undefined && projectId !== 'default') {
                    logger.error('OSS is only allowed to work with default project.');
                    return false;
                }
                const ossEnvs = ['default', 'development', 'production'];
                if (environment !== undefined &&
                    !ossEnvs.includes(environment)) {
                    logger.error(`OSS is only allowed to work with ${ossEnvs} environments.`);
                    return false;
                }
            }
            // DELETE segment does not include information about the segment's project
            // This is needed to check if the user has the right permissions on a project level
            if (!projectId &&
                permissionsArray.includes(permissions_1.UPDATE_PROJECT_SEGMENT) &&
                params.id) {
                const { id } = params;
                const segment = await segmentStore.get(id);
                if (segment === undefined) {
                    return false;
                }
                projectId = segment.project;
            }
            return accessService.hasPermission(user, permissionsArray, projectId, environment);
        };
        return next();
    };
};
exports.default = rbacMiddleware;
//# sourceMappingURL=rbac-middleware.js.map