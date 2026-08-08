"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../../../routes/controller"));
const permissions_1 = require("../../../types/permissions");
const feature_schema_1 = require("../../../schema/feature-schema");
const create_request_schema_1 = require("../../../openapi/util/create-request-schema");
const create_response_schema_1 = require("../../../openapi/util/create-response-schema");
const standard_responses_1 = require("../../../openapi/util/standard-responses");
const version = 1;
class FeatureController extends controller_1.default {
    constructor(config, { featureTagService, featureToggleService, openApiService, }) {
        super(config);
        this.tagService = featureTagService;
        this.openApiService = openApiService;
        this.service = featureToggleService;
        this.route({
            method: 'post',
            path: '/validate',
            handler: this.validate,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'validateFeature',
                    summary: 'Validate a feature flag name.',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('validateFeatureSchema'),
                    description: 'Validates a feature flag name: checks whether the name is URL-friendly and whether a feature with the given name already exists. Returns 200 if the feature name is compliant and unused.',
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 409, 415),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:featureName/tags',
            handler: this.listTags,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    summary: 'Get all tags for a feature.',
                    description: 'Retrieves all the tags for a feature name. If the feature does not exist it returns an empty list.',
                    tags: ['Features'],
                    operationId: 'listTags',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('tagsSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/:featureName/tags',
            permission: permissions_1.UPDATE_FEATURE,
            handler: this.addTag,
            middleware: [
                openApiService.validPath({
                    summary: 'Adds a tag to a feature.',
                    description: 'Adds a tag to a feature if the feature and tag type exist in the system. The operation is idempotent, so adding an existing tag will result in a successful response.',
                    tags: ['Features'],
                    operationId: 'addTag',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('tagSchema'),
                    responses: {
                        201: (0, create_response_schema_1.resourceCreatedResponseSchema)('tagSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: '/:featureName/tags',
            permission: permissions_1.UPDATE_FEATURE,
            handler: this.updateTags,
            middleware: [
                openApiService.validPath({
                    summary: 'Updates multiple tags for a feature.',
                    description: 'Receives a list of tags to add and a list of tags to remove that are mandatory but can be empty. All tags under addedTags are first added to the feature and then all tags under removedTags are removed from the feature.',
                    tags: ['Features'],
                    operationId: 'updateTags',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('updateTagsSchema'),
                    responses: {
                        200: (0, create_response_schema_1.resourceCreatedResponseSchema)('tagsSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: '/:featureName/tags/:type/:value',
            permission: permissions_1.UPDATE_FEATURE,
            acceptAnyContentType: true,
            handler: this.removeTag,
            middleware: [
                openApiService.validPath({
                    summary: 'Removes a tag from a feature.',
                    description: 'Removes a tag from a feature. If the feature exists but the tag does not, it returns a successful response.',
                    tags: ['Features'],
                    operationId: 'removeTag',
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    paramToArray(param) {
        if (!param) {
            return param;
        }
        return Array.isArray(param) ? param : [param];
    }
    async prepQuery({ tag, project, namePrefix, }) {
        if (!tag && !project && !namePrefix) {
            return {};
        }
        const tagQuery = this.paramToArray(tag);
        const projectQuery = this.paramToArray(project);
        const query = await feature_schema_1.querySchema.validateAsync({
            tag: tagQuery,
            project: projectQuery,
            namePrefix,
        });
        if (query.tag) {
            query.tag = query.tag.map((q) => q.split(':'));
        }
        return query;
    }
    async listTags(req, res) {
        const tags = await this.tagService.listTags(req.params.featureName);
        res.json({ version, tags });
    }
    async addTag(req, res) {
        const { featureName } = req.params;
        const tag = await this.tagService.addTag(featureName, req.body, req.audit);
        res.status(201).header('location', `${featureName}/tags`).json(tag);
    }
    async updateTags(req, res) {
        const { featureName } = req.params;
        const { addedTags, removedTags } = req.body;
        await Promise.all(addedTags.map((addedTag) => this.tagService.addTag(featureName, addedTag, req.audit)));
        await Promise.all(removedTags.map((removedTag) => this.tagService.removeTag(featureName, removedTag, req.audit)));
        const tags = await this.tagService.listTags(featureName);
        res.json({ version, tags });
    }
    // TODO
    async removeTag(req, res) {
        const { featureName, type, value } = req.params;
        await this.tagService.removeTag(featureName, { type, value }, req.audit);
        res.status(200).end();
    }
    async validate(req, res) {
        const { name, projectId } = req.body;
        await this.service.validateName(name);
        await this.service.validateFeatureFlagNameAgainstPattern(name, projectId ?? undefined);
        res.status(200).end();
    }
}
exports.default = FeatureController;
//# sourceMappingURL=feature-toggle-legacy-controller.js.map