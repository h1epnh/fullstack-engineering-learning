"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../../controller"));
const create_request_schema_1 = require("../../../openapi/util/create-request-schema");
const create_response_schema_1 = require("../../../openapi/util/create-response-schema");
const standard_responses_1 = require("../../../openapi/util/standard-responses");
const permissions_1 = require("../../../types/permissions");
const serialize_dates_1 = require("../../../types/serialize-dates");
const pat_schema_1 = require("../../../openapi/spec/pat-schema");
const pats_schema_1 = require("../../../openapi/spec/pats-schema");
const create_pat_schema_1 = require("../../../openapi/spec/create-pat-schema");
const error_1 = require("../../../error");
class PatController extends controller_1.default {
    constructor(config, { openApiService, patService, }) {
        super(config);
        this.logger = config.getLogger('lib/routes/auth/pat-controller.ts');
        this.flagResolver = config.flagResolver;
        this.openApiService = openApiService;
        this.patService = patService;
        this.route({
            method: 'get',
            path: '',
            handler: this.getPats,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Personal access tokens'],
                    operationId: 'getPats',
                    summary: 'Get all personal access tokens (PATs) for the current user.',
                    description: 'Returns all of the [personal access tokens](https://docs.getunleash.io/reference/api-tokens-and-client-keys#personal-access-tokens) (PATs) belonging to the current user.',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)(pats_schema_1.patsSchema.$id),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '',
            handler: this.createPat,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Personal access tokens'],
                    operationId: 'createPat',
                    summary: 'Create a new personal access token (PAT) for the current user.',
                    description: 'Creates a new [personal access token](https://docs.getunleash.io/reference/api-tokens-and-client-keys#personal-access-tokens (PAT) belonging to the current user.',
                    requestBody: (0, create_request_schema_1.createRequestSchema)(create_pat_schema_1.createPatSchema.$id),
                    responses: {
                        201: (0, create_response_schema_1.resourceCreatedResponseSchema)(pat_schema_1.patSchema.$id),
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: '/:id',
            acceptAnyContentType: true,
            handler: this.deletePat,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Personal access tokens'],
                    operationId: 'deletePat',
                    summary: 'Delete a personal access token (PAT) for the current user.',
                    description: 'Deletes a [personal access token](https://docs.getunleash.io/reference/api-tokens-and-client-keys#personal-access-tokens) (PAT) belonging to the current user.',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                            description: 'a personal access token id',
                        },
                    ],
                    responses: {
                        200: standard_responses_1.emptyResponse,
                        ...(0, standard_responses_1.getStandardResponses)(401, 403, 404),
                    },
                }),
            ],
        });
    }
    async createPat(req, res) {
        if (this.flagResolver.isEnabled('personalAccessTokensKillSwitch')) {
            throw new error_1.NotFoundError('PATs are disabled.');
        }
        if (!req.user.id) {
            throw new error_1.ForbiddenError('PATs require an authenticated user.');
        }
        const pat = req.body;
        const createdPat = await this.patService.createPat(pat, req.user.id, req.audit);
        this.openApiService.respondWithValidation(201, res, pat_schema_1.patSchema.$id, (0, serialize_dates_1.serializeDates)(createdPat));
    }
    async getPats(req, res) {
        if (this.flagResolver.isEnabled('personalAccessTokensKillSwitch')) {
            throw new error_1.NotFoundError('PATs are disabled.');
        }
        if (!req.user.id) {
            throw new error_1.ForbiddenError('PATs require an authenticated user.');
        }
        const pats = await this.patService.getAll(req.user.id);
        this.openApiService.respondWithValidation(200, res, pats_schema_1.patsSchema.$id, {
            pats: (0, serialize_dates_1.serializeDates)(pats),
        });
    }
    async deletePat(req, res) {
        const { id } = req.params;
        await this.patService.deletePat(id, req.user.id, req.audit);
        res.status(200).end();
    }
}
exports.default = PatController;
//# sourceMappingURL=pat.js.map