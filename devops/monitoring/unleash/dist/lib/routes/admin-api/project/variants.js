"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../../controller"));
const permissions_1 = require("../../../types/permissions");
const model_1 = require("../../../types/model");
const extract_user_1 = require("../../../util/extract-user");
const create_request_schema_1 = require("../../../openapi/util/create-request-schema");
const create_response_schema_1 = require("../../../openapi/util/create-response-schema");
const error_1 = require("../../../../lib/error");
const openapi_1 = require("../../../openapi");
const PREFIX = '/:projectId/features/:featureName/variants';
const ENV_PREFIX = '/:projectId/features/:featureName/environments/:environment/variants';
class VariantsController extends controller_1.default {
    constructor(config, { featureToggleService, openApiService, accessService, }) {
        super(config);
        this.logger = config.getLogger('admin-api/project/variants.ts');
        this.featureService = featureToggleService;
        this.accessService = accessService;
        this.route({
            method: 'get',
            path: PREFIX,
            permission: permissions_1.NONE,
            handler: this.getVariants,
            middleware: [
                openApiService.validPath({
                    summary: 'Retrieve variants for a feature (deprecated) ',
                    description: '(deprecated from 4.21) Retrieve the variants for the specified feature. From Unleash 4.21 onwards, this endpoint will attempt to choose a [production-type environment](https://docs.getunleash.io/reference/environments) as the source of truth. If more than one production environment is found, the first one will be used.',
                    deprecated: true,
                    tags: ['Features'],
                    operationId: 'getFeatureVariants',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('featureVariantsSchema'),
                        ...(0, openapi_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'patch',
            path: PREFIX,
            permission: permissions_1.UPDATE_FEATURE_VARIANTS,
            handler: this.patchVariants,
            middleware: [
                openApiService.validPath({
                    summary: "Apply a patch to a feature's variants (in all environments).",
                    description: `Apply a list of patches patch to the specified feature's variants. The patch objects should conform to the [JSON-patch format (RFC 6902)](https://www.rfc-editor.org/rfc/rfc6902).

⚠️ **Warning**: This method is not atomic. If something fails in the middle of applying the patch, you can be left with a half-applied patch. We recommend that you instead [patch variants on a per-environment basis](/docs/reference/api/unleash/patch-environments-feature-variants.api.mdx), which **is** an atomic operation.`,
                    tags: ['Features'],
                    operationId: 'patchFeatureVariants',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('patchesSchema'),
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('featureVariantsSchema'),
                        ...(0, openapi_1.getStandardResponses)(400, 401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: PREFIX,
            permission: permissions_1.UPDATE_FEATURE_VARIANTS,
            handler: this.overwriteVariants,
            middleware: [
                openApiService.validPath({
                    summary: 'Create (overwrite) variants for a feature flag in all environments',
                    description: `This overwrites the current variants for the feature specified in the :featureName parameter in all environments.

The backend will validate the input for the following invariants

* If there are variants, there needs to be at least one variant with \`weightType: variable\`
* The sum of the weights of variants with \`weightType: fix\` must be strictly less than 1000 (< 1000)

The backend will also distribute remaining weight up to 1000 after adding the variants with \`weightType: fix\` together amongst the variants of \`weightType: variable\``,
                    tags: ['Features'],
                    operationId: 'overwriteFeatureVariants',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('variantsSchema'),
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('featureVariantsSchema'),
                        ...(0, openapi_1.getStandardResponses)(400, 401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: ENV_PREFIX,
            permission: permissions_1.NONE,
            handler: this.getVariantsOnEnv,
            middleware: [
                openApiService.validPath({
                    summary: 'Get variants for a feature in an environment',
                    description: `Returns the variants for a feature in a specific environment. If the feature has no variants it will return an empty array of variants`,
                    tags: ['Features'],
                    operationId: 'getEnvironmentFeatureVariants',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('featureVariantsSchema'),
                        ...(0, openapi_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'patch',
            path: ENV_PREFIX,
            permission: permissions_1.UPDATE_FEATURE_ENVIRONMENT_VARIANTS,
            handler: this.patchVariantsOnEnv,
            middleware: [
                openApiService.validPath({
                    summary: "Patch a feature's variants in an environment",
                    description: `Apply a list of patches to the features environments in the specified environment. The patch objects should conform to the [JSON-patch format (RFC 6902)](https://www.rfc-editor.org/rfc/rfc6902).`,
                    tags: ['Features'],
                    operationId: 'patchEnvironmentsFeatureVariants',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('patchesSchema'),
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('featureVariantsSchema'),
                        ...(0, openapi_1.getStandardResponses)(400, 401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: ENV_PREFIX,
            permission: permissions_1.UPDATE_FEATURE_ENVIRONMENT_VARIANTS,
            handler: this.overwriteVariantsOnEnv,
            middleware: [
                openApiService.validPath({
                    summary: 'Create (overwrite) variants for a feature in an environment',
                    description: `This overwrites the current variants for the feature flag in the :featureName parameter for the :environment parameter.

The backend will validate the input for the following invariants:

* If there are variants, there needs to be at least one variant with \`weightType: variable\`
* The sum of the weights of variants with \`weightType: fix\` must be strictly less than 1000 (< 1000)

The backend will also distribute remaining weight up to 1000 after adding the variants with \`weightType: fix\` together amongst the variants of \`weightType: variable\``,
                    tags: ['Features'],
                    operationId: 'overwriteEnvironmentFeatureVariants',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('variantsSchema'),
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('featureVariantsSchema'),
                        ...(0, openapi_1.getStandardResponses)(400, 401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: `${PREFIX}-batch`,
            permission: permissions_1.NONE,
            handler: this.pushVariantsToEnvironments,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'overwriteFeatureVariantsOnEnvironments',
                    summary: 'Create (overwrite) variants for a feature flag in multiple environments',
                    description: 'This overwrites the current variants for the feature flag in the :featureName parameter for the :environment parameter.',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('pushVariantsSchema'),
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('featureVariantsSchema'),
                        ...(0, openapi_1.getStandardResponses)(400, 401, 403),
                    },
                }),
            ],
        });
    }
    /**
     * @deprecated - Variants should be fetched from featureService.getVariantsForEnv (since variants are now; since 4.18, connected to environments)
     * @param req
     * @param res
     */
    async getVariants(req, res) {
        const { featureName } = req.params;
        const variants = await this.featureService.getVariants(featureName);
        res.status(200).json({ version: 1, variants: variants || [] });
    }
    async patchVariants(req, res) {
        const { projectId, featureName } = req.params;
        const updatedFeature = await this.featureService.updateVariants(featureName, projectId, req.body, req.user, req.audit);
        res.status(200).json({
            version: 1,
            variants: updatedFeature.variants || [],
        });
    }
    async overwriteVariants(req, res) {
        const { projectId, featureName } = req.params;
        const userName = (0, extract_user_1.extractUsername)(req);
        const updatedFeature = await this.featureService.saveVariants(featureName, projectId, req.body, req.audit);
        res.status(200).json({
            version: 1,
            variants: updatedFeature.variants || [],
        });
    }
    async pushVariantsToEnvironments(req, res) {
        const { projectId, featureName } = req.params;
        const { environments, variants } = req.body;
        if (environments === undefined || environments.length === 0) {
            throw new error_1.BadDataError('No environments provided');
        }
        await this.checkAccess(req.user, projectId, environments, permissions_1.UPDATE_FEATURE_ENVIRONMENT_VARIANTS);
        const variantsWithDefaults = (variants || []).map((variant) => ({
            weightType: model_1.WeightType.VARIABLE,
            stickiness: 'default',
            ...variant,
        }));
        await this.featureService.crProtectedSetVariantsOnEnvs(projectId, featureName, environments, variantsWithDefaults, req.user, req.audit);
        res.status(200).json({
            version: 1,
            variants: variantsWithDefaults,
        });
    }
    async checkAccess(user, projectId, environments, permission) {
        for (const environment of environments) {
            if (!(await this.accessService.hasPermission(user, permission, projectId, environment))) {
                throw new error_1.PermissionError(permissions_1.UPDATE_FEATURE_ENVIRONMENT_VARIANTS, environment);
            }
        }
    }
    async getVariantsOnEnv(req, res) {
        const { featureName, environment } = req.params;
        const variants = await this.featureService.getVariantsForEnv(featureName, environment);
        res.status(200).json({ version: 1, variants: variants || [] });
    }
    async patchVariantsOnEnv(req, res) {
        const { projectId, featureName, environment } = req.params;
        const variants = await this.featureService.updateVariantsOnEnv(featureName, projectId, environment, req.body, req.user, req.audit);
        res.status(200).json({
            version: 1,
            variants,
        });
    }
    async overwriteVariantsOnEnv(req, res) {
        const { featureName, environment, projectId } = req.params;
        const variants = await this.featureService.crProtectedSaveVariantsOnEnv(projectId, featureName, environment, req.body, req.user, req.audit);
        res.status(200).json({
            version: 1,
            variants: variants,
        });
    }
}
exports.default = VariantsController;
//# sourceMappingURL=variants.js.map