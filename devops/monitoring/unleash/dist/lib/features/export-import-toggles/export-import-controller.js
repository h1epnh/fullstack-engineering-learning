"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../../routes/controller"));
const types_1 = require("../../types");
const openapi_1 = require("../../openapi");
const util_1 = require("../../util");
const error_1 = require("../../error");
const api_user_1 = __importDefault(require("../../types/api-user"));
class ExportImportController extends controller_1.default {
    constructor(config, { exportService, importService, openApiService, }) {
        super(config);
        this.logger = config.getLogger('/admin-api/export-import.ts');
        this.exportService = exportService;
        this.importService = importService;
        this.openApiService = openApiService;
        this.route({
            method: 'post',
            path: '/export',
            permission: types_1.NONE,
            handler: this.export,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Import/Export'],
                    operationId: 'exportFeatures',
                    requestBody: (0, openapi_1.createRequestSchema)('exportQuerySchema'),
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('exportResultSchema'),
                        ...(0, openapi_1.getStandardResponses)(404),
                    },
                    description: "Exports all features listed in the `features` property from the environment specified in the request body. If set to `true`, the `downloadFile` property will let you download a file with the exported data. Otherwise, the export data is returned directly as JSON. Refer to the documentation for more information about [Unleash's export functionality](https://docs.getunleash.io/reference/deploy/environment-import-export#export).",
                    summary: 'Export feature flags from an environment',
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/validate',
            permission: types_1.NONE,
            handler: this.validateImport,
            middleware: [
                openApiService.validPath({
                    tags: ['Import/Export'],
                    operationId: 'validateImport',
                    requestBody: (0, openapi_1.createRequestSchema)('importTogglesSchema'),
                    responses: {
                        200: (0, openapi_1.createResponseSchema)('importTogglesValidateSchema'),
                        ...(0, openapi_1.getStandardResponses)(404),
                    },
                    summary: 'Validate feature import data',
                    description: `Validates a feature flag data set. Checks whether the data can be imported into the specified project and environment. The returned value is an object that contains errors, warnings, and permissions required to perform the import, as described in the [import documentation](https://docs.getunleash.io/reference/deploy/environment-import-export#import).`,
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/import',
            permission: types_1.NONE,
            handler: this.importData,
            middleware: [
                openApiService.validPath({
                    tags: ['Import/Export'],
                    operationId: 'importToggles',
                    requestBody: (0, openapi_1.createRequestSchema)('importTogglesSchema'),
                    responses: {
                        200: openapi_1.emptyResponse,
                        ...(0, openapi_1.getStandardResponses)(404),
                    },
                    summary: 'Import feature flags',
                    description: `[Import feature flags](https://docs.getunleash.io/reference/deploy/environment-import-export#import) into a specific project and environment.`,
                }),
            ],
        });
    }
    async export(req, res) {
        const query = req.body;
        const userName = (0, util_1.extractUsername)(req);
        const data = await this.exportService.export(query, req.audit);
        this.openApiService.respondWithValidation(200, res, openapi_1.exportResultSchema.$id, (0, types_1.serializeDates)(data));
    }
    async validateImport(req, res) {
        const dto = req.body;
        const { user } = req;
        const validation = await this.importService.transactional((service) => service.validate(dto, user));
        this.openApiService.respondWithValidation(200, res, openapi_1.importTogglesValidateSchema.$id, validation);
    }
    async importData(req, res) {
        const { user, audit } = req;
        if (user instanceof api_user_1.default && user.type === 'admin') {
            throw new error_1.BadDataError(`You can't use an admin token to import features. Please use either a personal access token (https://docs.getunleash.io/reference/api-tokens-and-client-keys#personal-access-tokens) or a service account (https://docs.getunleash.io/reference/service-accounts).`);
        }
        const dto = req.body;
        await this.importService.transactional((service) => service.import(dto, user, audit));
        res.status(200).end();
    }
}
exports.default = ExportImportController;
//# sourceMappingURL=export-import-controller.js.map