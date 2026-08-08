"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playgroundViewModel = exports.advancedPlaygroundViewModel = void 0;
const buildStrategyLink = (project, feature, environment, strategyId) => `/projects/${project}/features/${feature}/strategies/edit?environmentId=${environment}&strategyId=${strategyId}`;
const addStrategyEditLink = (environmentId, projectId, featureName, strategy) => {
    return {
        ...strategy,
        links: {
            edit: buildStrategyLink(projectId, featureName, environmentId, strategy.id),
        },
    };
};
const advancedPlaygroundViewModel = (input, playgroundResult, invalidContextProperties) => {
    const features = playgroundResult.map(({ environments, ...rest }) => {
        const transformedEnvironments = Object.entries(environments).map(([envName, envFeatures]) => {
            const transformedFeatures = envFeatures.map(({ name, strategies, environment, projectId, ...featRest }) => ({
                ...featRest,
                name,
                environment,
                projectId,
                strategies: {
                    ...strategies,
                    data: strategies.data.map((strategy) => addStrategyEditLink(environment, projectId, name, strategy)),
                },
            }));
            return [envName, transformedFeatures];
        });
        return {
            ...rest,
            environments: Object.fromEntries(transformedEnvironments),
        };
    });
    if (invalidContextProperties?.length) {
        return { features, input, warnings: { invalidContextProperties } };
    }
    return { features, input };
};
exports.advancedPlaygroundViewModel = advancedPlaygroundViewModel;
const playgroundViewModel = (input, playgroundResult) => {
    const features = playgroundResult.map(({ name, strategies, projectId, ...rest }) => ({
        ...rest,
        name,
        projectId,
        strategies: {
            ...strategies,
            data: strategies.data.map((strategy) => addStrategyEditLink(input.environment, projectId, name, strategy)),
        },
    }));
    return { input, features };
};
exports.playgroundViewModel = playgroundViewModel;
//# sourceMappingURL=playground-view-model.js.map