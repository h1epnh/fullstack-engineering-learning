"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../controller"));
const permissions_1 = require("../../types/permissions");
const create_response_schema_1 = require("../../openapi/util/create-response-schema");
const telemetry_settings_schema_1 = require("../../openapi/spec/telemetry-settings-schema");
class TelemetryController extends controller_1.default {
    constructor(config, { openApiService }) {
        super(config);
        this.openApiService = openApiService;
        this.route({
            method: 'get',
            path: '/settings',
            handler: this.getTelemetrySettings,
            permission: permissions_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Telemetry'],
                    summary: 'Get telemetry settings',
                    description: 'Provides the configured settings for [telemetry information collection](https://docs.getunleash.io/topics/data-collection)',
                    operationId: 'getTelemetrySettings',
                    responses: {
                        200: (0, create_response_schema_1.createResponseSchema)('telemetrySettingsSchema'),
                    },
                }),
            ],
        });
    }
    async getTelemetrySettings(req, res) {
        this.openApiService.respondWithValidation(200, res, telemetry_settings_schema_1.telemetrySettingsSchema.$id, {
            versionInfoCollectionEnabled: this.config.versionCheck.enable,
            featureInfoCollectionEnabled: this.config.telemetry,
        });
    }
}
exports.default = TelemetryController;
//# sourceMappingURL=telemetry.js.map