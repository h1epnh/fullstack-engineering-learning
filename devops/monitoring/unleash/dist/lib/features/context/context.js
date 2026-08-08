"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextController = void 0;
const controller_1 = __importDefault(require("../../routes/controller"));
const permissions_1 = require("../../types/permissions");
const context_field_schema_1 = require("../../openapi/spec/context-field-schema");
const create_request_schema_1 = require("../../openapi/util/create-request-schema");
const create_response_schema_1 = require("../../openapi/util/create-response-schema");
const serialize_dates_1 = require("../../types/serialize-dates");
const notfound_error_1 = __importDefault(require("../../error/notfound-error"));
const standard_responses_1 = require("../../openapi/util/standard-responses");
const context_field_strategies_schema_1 = require("../../openapi/spec/context-field-strategies-schema");
const util_1 = require("../../util");
class ContextController extends controller_1.default {
    constructor(config, { transactionalContextService, openApiService, }) {
        super(config);
        this.openApiService = openApiService;
        this.logger = config.getLogger('/admin-api/context.ts');
        this.transactionalContextService = transactionalContextService;
        this.route({
            method: 'get',
            path: '',
            handler: this.getContextFields,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Gets configured context fields',
                    description: 'Returns all configured [Context fields](https://docs.getunleash.io/reference/unleash-context) that have been created.',
                    operationId: 'getContextFields',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('contextFieldsSchema'),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:contextField',
            handler: this.getContextField,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Gets context field',
                    description: 'Returns specific [context field](https://docs.getunleash.io/reference/unleash-context) identified by the name in the path',
                    operationId: 'getContextField',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('contextFieldSchema'),
                    },
                }),
            ],
        });
        this.route({
            method: 'get',
            path: '/:contextField/strategies',
            handler: this.getStrategiesByContextField,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Strategies'],
                    operationId: 'getStrategiesByContextField',
                    summary: 'Get strategies that use a context field',
                    description: "Retrieves a list of all strategies that use the specified context field. If the context field doesn't exist, returns an empty list of strategies",
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('contextFieldStrategiesSchema'),
                        ...(0, standard_responses_1.getStandardResponses)(401),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '',
            handler: this.createContextField,
            permission: permissions_1.CREATE_CONTEXT_FIELD,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    operationId: 'createContextField',
                    summary: 'Create a context field',
                    description: 'Endpoint that allows creation of [custom context fields](https://docs.getunleash.io/reference/unleash-context#custom-context-fields)',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('createContextFieldSchema'),
                    responses: {
                        201: (0, create_response_schema_1.resourceCreatedResponseSchema)('contextFieldSchema'),
                    },
                }),
            ],
        });
        this.route({
            method: 'put',
            path: '/:contextField',
            handler: this.updateContextField,
            permission: permissions_1.UPDATE_CONTEXT_FIELD,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Update an existing context field',
                    description: `Endpoint that allows updating a custom context field. Used to toggle stickiness and add/remove legal values for this context field`,
                    operationId: 'updateContextField',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('updateContextFieldSchema'),
                    responses: {
                        200: standard_responses_1.emptyResponse,
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/:contextField/legal-values',
            handler: this.updateLegalValue,
            permission: permissions_1.UPDATE_CONTEXT_FIELD,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Add or update legal value for the context field',
                    description: `Endpoint that allows adding or updating a single custom context field legal value. If the legal value already exists, it will be updated with the new description`,
                    operationId: 'updateContextFieldLegalValue',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('legalValueSchema'),
                    responses: {
                        200: standard_responses_1.emptyResponse,
                    },
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: '/:contextField/legal-values/:legalValue',
            handler: this.deleteLegalValue,
            acceptAnyContentType: true,
            permission: permissions_1.UPDATE_CONTEXT_FIELD,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Delete legal value for the context field',
                    description: `Removes the specified custom context field legal value. Does not validate that the legal value is not in use and does not remove usage from constraints that use it.`,
                    operationId: 'deleteContextFieldLegalValue',
                    responses: {
                        200: standard_responses_1.emptyResponse,
                    },
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: '/:contextField',
            handler: this.deleteContextField,
            acceptAnyContentType: true,
            permission: permissions_1.DELETE_CONTEXT_FIELD,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Delete an existing context field',
                    description: 'Endpoint that allows deletion of a custom context field. Does not validate that context field is not in use, but since context field configuration is stored in a json blob for the strategy, existing strategies are safe.',
                    operationId: 'deleteContextField',
                    responses: {
                        200: standard_responses_1.emptyResponse,
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/validate',
            handler: this.validate,
            permission: permissions_1.UPDATE_CONTEXT_FIELD,
            middleware: [
                openApiService.validPath({
                    tags: ['Context'],
                    summary: 'Validate a context field',
                    description: 'Check whether the provided data can be used to create a context field. If the data is not valid, ...?',
                    operationId: 'validate',
                    requestBody: (0, create_request_schema_1.createRequestSchema)('nameSchema'),
                    responses: {
                        200: standard_responses_1.emptyResponse,
                    },
                }),
            ],
        });
    }
    async getContextFields(req, res) {
        res.status(200)
            .json((0, serialize_dates_1.serializeDates)(await this.transactionalContextService.getAll()))
            .end();
    }
    async getContextField(req, res) {
        try {
            const name = req.params.contextField;
            const contextField = await this.transactionalContextService.getContextField(name);
            this.openApiService.respondWithValidation(200, res, context_field_schema_1.contextFieldSchema.$id, (0, serialize_dates_1.serializeDates)(contextField));
        }
        catch (err) {
            throw new notfound_error_1.default('Could not find context field');
        }
    }
    async createContextField(req, res) {
        const value = req.body;
        const result = await this.transactionalContextService.transactional((service) => service.createContextField(value, req.audit));
        this.openApiService.respondWithValidation(201, res, context_field_schema_1.contextFieldSchema.$id, (0, serialize_dates_1.serializeDates)(result), { location: `context/${result.name}` });
    }
    async updateContextField(req, res) {
        const name = req.params.contextField;
        const contextField = req.body;
        await this.transactionalContextService.transactional((service) => service.updateContextField({ ...contextField, name }, req.audit));
        res.status(200).end();
    }
    async updateLegalValue(req, res) {
        const name = req.params.contextField;
        const legalValue = req.body;
        await this.transactionalContextService.transactional((service) => service.updateLegalValue({ name, legalValue }, req.audit));
        res.status(200).end();
    }
    async deleteLegalValue(req, res) {
        const name = req.params.contextField;
        const legalValue = req.params.legalValue;
        await this.transactionalContextService.transactional((service) => service.deleteLegalValue({ name, legalValue }, req.audit));
        res.status(200).end();
    }
    async deleteContextField(req, res) {
        const name = req.params.contextField;
        await this.transactionalContextService.transactional((service) => service.deleteContextField(name, req.audit));
        res.status(200).end();
    }
    async validate(req, res) {
        const { name } = req.body;
        await this.transactionalContextService.validateName(name);
        res.status(200).end();
    }
    async getStrategiesByContextField(req, res) {
        const { contextField } = req.params;
        const { user } = req;
        const contextFields = await this.transactionalContextService.getStrategiesByContextField(contextField, (0, util_1.extractUserIdFromUser)(user));
        this.openApiService.respondWithValidation(200, res, context_field_strategies_schema_1.contextFieldStrategiesSchema.$id, (0, serialize_dates_1.serializeDates)(contextFields));
    }
}
exports.ContextController = ContextController;
//# sourceMappingURL=context.js.map