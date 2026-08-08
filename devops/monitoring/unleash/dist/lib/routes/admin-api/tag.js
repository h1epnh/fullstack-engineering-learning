"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../controller"));
const permissions_1 = require("../../types/permissions");
const extract_user_1 = require("../../util/extract-user");
const create_request_schema_1 = require("../../openapi/util/create-request-schema");
const create_response_schema_1 = require("../../openapi/util/create-response-schema");
const tags_schema_1 = require("../../openapi/spec/tags-schema");
const tag_with_version_schema_1 = require("../../openapi/spec/tag-with-version-schema");
const standard_responses_1 = require("../../openapi/util/standard-responses");
const version = 1;
class TagController extends controller_1.default {
    constructor(config, { tagService, openApiService, featureTagService, }) {
        super(config);
        this.tagService = tagService;
        this.openApiService = openApiService;
        this.featureTagService = featureTagService;
        this.logger = config.getLogger('/admin-api/tag.js');
        this.flagResolver = config.flagResolver;
        this.route({
            method: 'get',
            path: '',
            handler: this.getTags,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'getTags',
                    summary: 'List all tags.',
                    description: 'List all tags available in Unleash.',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('tagsSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '',
            handler: this.createTag,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'createTag',
                    summary: 'Create a new tag.',
                    description: 'Create a new tag with the specified data.',
                    responses: {
                        201: (0, create_response_schema_1.resourceCreatedResponseSchema)('tagWithVersionSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403, 409, 415),
                    },
                    requestBody: (0, create_request_schema_1.createRequestSchema)('createTagSchema'),
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:type',
            handler: this.getTagsByType,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'getTagsByType',
                    summary: 'List all tags of a given type.',
                    description: 'List all tags of a given type. If the tag type does not exist it returns an empty list.',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('tagsSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:type/:value',
            handler: this.getTag,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'getTag',
                    summary: 'Get a tag by type and value.',
                    description: 'Get a tag by type and value. Can be used to check whether a given tag already exists in Unleash or not.',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('tagWithVersionSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: '/:type/:value',
            handler: this.deleteTag,
            acceptAnyContentType: true,
            permission: permissions_1.UPDATE_FEATURE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'deleteTag',
                    summary: 'Delete a tag.',
                    description: 'Delete a tag by type and value. When a tag is deleted all references to the tag are removed.',
                    responses: {
                        200: standard_responses_1.emptyResponse,
                    },
                }),
            ],
        });
    }
    async getTags(req, res) {
        const tags = await this.tagService.getTags();
        this.openApiService.respondWithValidation(200, res, tags_schema_1.tagsSchema.$id, { version, tags });
    }
    async getTagsByType(req, res) {
        const tags = await this.tagService.getTagsByType(req.params.type);
        this.openApiService.respondWithValidation(200, res, tags_schema_1.tagsSchema.$id, { version, tags });
    }
    async getTag(req, res) {
        const { type, value } = req.params;
        const tag = await this.tagService.getTag({ type, value });
        this.openApiService.respondWithValidation(200, res, tag_with_version_schema_1.tagWithVersionSchema.$id, { version, tag });
    }
    async createTag(req, res) {
        const userName = (0, extract_user_1.extractUsername)(req);
        const tag = await this.tagService.createTag(req.body, req.audit);
        res.status(201)
            .header('location', `tags/${tag.type}/${tag.value}`)
            .json({ version, tag })
            .end();
    }
    async deleteTag(req, res) {
        const { type, value } = req.params;
        const userName = (0, extract_user_1.extractUsername)(req);
        await this.tagService.deleteTag({ type, value }, req.audit);
        res.status(200).end();
    }
}
exports.default = TagController;
//# sourceMappingURL=tag.js.map