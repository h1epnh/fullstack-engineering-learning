"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../../routes/controller"));
const permissions_1 = require("../../types/permissions");
const create_request_schema_1 = require("../../openapi/util/create-request-schema");
const create_response_schema_1 = require("../../openapi/util/create-response-schema");
const validate_tag_type_schema_1 = require("../../openapi/spec/validate-tag-type-schema");
const standard_responses_1 = require("../../openapi/util/standard-responses");
const version = 1;
class TagTypeController extends controller_1.default {
    constructor(config, { transactionalTagTypeService, openApiService, }) {
        super(config);
        this.logger = config.getLogger('/admin-api/tag-type.js');
        this.tagTypeService = transactionalTagTypeService;
        this.openApiService = openApiService;
        this.route({
            method: 'get',
            path: '',
            handler: this.getTagTypes,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'getTagTypes',
                    summary: 'Get all tag types',
                    description: 'Get a list of all available tag types.',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('tagTypesSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '',
            handler: this.createTagType,
            permission: permissions_1.CREATE_TAG_TYPE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'createTagType',
                    summary: 'Create a tag type',
                    description: 'Create a new tag type.',
                    responses: {
                        201: (0, create_response_schema_1.resourceCreatedResponseSchema)('tagTypeSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403, 409, 415),
                    },
                    requestBody: (0, create_request_schema_1.createRequestSchema)('tagTypeSchema'),
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/validate',
            handler: this.validateTagType,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'validateTagType',
                    summary: 'Validate a tag type',
                    description: 'Validates whether if the body of the request is a valid tag and whether the a tag type with that name already exists or not. If a tag type with the same name exists, this operation will return a 409 status code.',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('validateTagTypeSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403, 409, 415),
                    },
                    requestBody: (0, create_request_schema_1.createRequestSchema)('tagTypeSchema'),
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:name',
            handler: this.getTagType,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'getTagType',
                    summary: 'Get a tag type',
                    description: 'Get a tag type by name.',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('tagTypeSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: '/:name',
            handler: this.updateTagType,
            permission: permissions_1.UPDATE_TAG_TYPE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'updateTagType',
                    summary: 'Update a tag type',
                    description: 'Update the configuration for the specified tag type.',
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(400, 401, 403, 415),
                    },
                    requestBody: (0, create_request_schema_1.createRequestSchema)('updateTagTypeSchema'),
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: '/:name',
            handler: this.deleteTagType,
            acceptAnyContentType: true,
            permission: permissions_1.DELETE_TAG_TYPE,
            middleware: [
                openApiService.validPath({
                    tags: ['Tags'],
                    operationId: 'deleteTagType',
                    summary: 'Delete a tag type',
                    description: 'Deletes a tag type. If any features have tags of this type, those tags will be deleted.',
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 403),
                    },
                }),
            ],
        });
    }
    async getTagTypes(req, res) {
        const tagTypes = await this.tagTypeService.getAll();
        res.json({ version, tagTypes });
    }
    async validateTagType(req, res) {
        await this.tagTypeService.validate(req.body);
        this.openApiService.respondWithValidation(200, res, validate_tag_type_schema_1.validateTagTypeSchema.$id, {
            valid: true,
            tagType: req.body,
        });
    }
    async createTagType(req, res) {
        const tagType = await this.tagTypeService.transactional((service) => service.createTagType(req.body, req.audit));
        res.status(201)
            .header('location', `tag-types/${tagType.name}`)
            .json(tagType);
    }
    async updateTagType(req, res) {
        const { description, icon, color } = req.body;
        const { name } = req.params;
        await this.tagTypeService.transactional((service) => service.updateTagType({
            name,
            description,
            icon,
            color: color,
        }, req.audit));
        res.status(200).end();
    }
    async getTagType(req, res) {
        const { name } = req.params;
        const tagType = await this.tagTypeService.getTagType(name);
        res.json({ version, tagType });
    }
    async deleteTagType(req, res) {
        const { name } = req.params;
        await this.tagTypeService.transactional((service) => service.deleteTagType(name, req.audit));
        res.status(200).end();
    }
}
exports.default = TagTypeController;
module.exports = TagTypeController;
//# sourceMappingURL=tag-type.js.map