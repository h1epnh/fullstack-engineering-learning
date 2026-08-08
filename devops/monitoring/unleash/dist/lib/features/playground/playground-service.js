"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaygroundService = void 0;
const api_token_1 = require("../../types/models/api-token");
const offline_unleash_client_1 = require("./offline-unleash-client");
const generateObjectCombinations_1 = require("./generateObjectCombinations");
const lodash_groupby_1 = __importDefault(require("lodash.groupby"));
const util_1 = require("../../util");
const validateQueryComplexity_1 = require("./validateQueryComplexity");
const variant_1 = require("./feature-evaluator/variant");
const clean_context_1 = require("./clean-context");
class PlaygroundService {
    constructor(config, { featureToggleService, privateProjectChecker, }, segmentReadModel) {
        this.logger = config.getLogger('services/playground-service.ts');
        this.flagResolver = config.flagResolver;
        this.featureToggleService = featureToggleService;
        this.privateProjectChecker = privateProjectChecker;
        this.segmentReadModel = segmentReadModel;
    }
    async evaluateAdvancedQuery(projects, environments, context, userId) {
        // used for runtime control, do not remove
        const { payload } = this.flagResolver.getVariant('advancedPlayground');
        const limit = payload?.value && Number.isInteger(Number.parseInt(payload?.value))
            ? Number.parseInt(payload?.value)
            : 15000;
        const segments = await this.segmentReadModel.getActive();
        let filteredProjects = projects;
        const projectAccess = await this.privateProjectChecker.getUserAccessibleProjects(userId);
        if (projectAccess.mode === 'all') {
            filteredProjects = projects;
        }
        else if (projects === api_token_1.ALL) {
            filteredProjects = projectAccess.projects;
        }
        else {
            filteredProjects = projects.filter((project) => projectAccess.projects.includes(project));
        }
        const environmentFeatures = await Promise.all(environments.map((env) => this.resolveFeatures(filteredProjects, env)));
        const { context: cleanedContext, removedProperties } = (0, clean_context_1.cleanContext)(context);
        const contexts = (0, generateObjectCombinations_1.generateObjectCombinations)(cleanedContext);
        (0, validateQueryComplexity_1.validateQueryComplexity)(environments.length, environmentFeatures[0]?.features.length ?? 0, contexts.length, limit);
        const results = await Promise.all(environmentFeatures.flatMap(({ features, featureProject, environment }) => contexts.map((singleContext) => this.evaluate({
            features,
            featureProject,
            context: singleContext,
            segments,
            environment,
        }))));
        const items = results.flat();
        const itemsByName = (0, lodash_groupby_1.default)(items, (item) => item.name);
        const result = Object.values(itemsByName).map((entries) => {
            const groupedEnvironments = (0, lodash_groupby_1.default)(entries, (entry) => entry.environment);
            return {
                name: entries[0].name,
                projectId: entries[0].projectId,
                environments: groupedEnvironments,
            };
        });
        return {
            result,
            invalidContextProperties: removedProperties,
        };
    }
    async evaluate({ featureProject, features, segments, context, environment, }) {
        const [head, ...rest] = features;
        if (!head) {
            return [];
        }
        else {
            const client = await (0, offline_unleash_client_1.offlineUnleashClient)({
                features: [head, ...rest],
                context,
                logError: this.logger.error,
                segments,
            });
            const variantsMap = features.reduce((acc, feature) => {
                acc[feature.name] = feature.variants;
                return acc;
            }, {});
            const clientContext = {
                ...context,
                currentTime: context.currentTime
                    ? new Date(context.currentTime)
                    : undefined,
            };
            return client
                .getFeatureToggleDefinitions()
                .map((feature) => {
                const strategyEvaluationResult = client.isEnabled(feature.name, clientContext);
                const hasUnsatisfiedDependency = strategyEvaluationResult.hasUnsatisfiedDependency;
                const isEnabled = strategyEvaluationResult.result === true &&
                    feature.enabled &&
                    !hasUnsatisfiedDependency;
                const variant = {
                    ...(isEnabled
                        ? client.forceGetVariant(feature.name, strategyEvaluationResult, clientContext)
                        : (0, variant_1.getDefaultVariant)()),
                    feature_enabled: isEnabled,
                };
                return {
                    isEnabled,
                    isEnabledInCurrentEnvironment: feature.enabled,
                    hasUnsatisfiedDependency,
                    strategies: {
                        result: strategyEvaluationResult.result,
                        data: strategyEvaluationResult.strategies,
                    },
                    projectId: featureProject[feature.name],
                    variant,
                    name: feature.name,
                    environment,
                    context,
                    variants: strategyEvaluationResult.variants ||
                        variantsMap[feature.name] ||
                        [],
                };
            });
        }
    }
    async resolveFeatures(projects, environment) {
        const features = await this.featureToggleService.getPlaygroundFeatures({
            project: projects === api_token_1.ALL ? undefined : projects,
            environment,
        });
        const featureProject = features.reduce((obj, feature) => {
            obj[feature.name] = feature.project;
            return obj;
        }, {});
        return { features, featureProject, environment };
    }
    async evaluateQuery(projects, environment, context) {
        const [{ features, featureProject }, segments] = await Promise.all([
            this.resolveFeatures(projects, environment),
            this.segmentReadModel.getActive(),
        ]);
        const result = await this.evaluate({
            features,
            featureProject,
            segments,
            context,
            environment,
        });
        return result.map((item) => (0, util_1.omitKeys)(item, 'environment', 'context'));
    }
}
exports.PlaygroundService = PlaygroundService;
//# sourceMappingURL=playground-service.js.map