"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenApiService = void 0;
const openapi_1 = __importDefault(require("@wesleytodd/openapi"));
const openapi_2 = require("../openapi");
const validate_1 = require("../openapi/validate");
class OpenApiService {
    constructor(config) {
        this.config = config;
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger('openapi-service.ts');
        this.api = (0, openapi_1.default)(this.docsPath(), (0, openapi_2.createOpenApiSchema)(config.server), {
            coerce: true,
            extendRefs: true,
            basePath: config.server.baseUriPath,
        });
    }
    validPath(op) {
        return this.api.validPath(op);
    }
    useDocs(app) {
        app.use(this.api);
        app.use(this.docsPath(), this.api.swaggerui());
    }
    docsPath() {
        const { baseUriPath = '' } = this.config.server ?? {};
        return `${baseUriPath}/docs/openapi`;
    }
    registerCustomSchemas(schemas) {
        Object.entries(schemas).forEach(([name, schema]) => {
            this.api.schema(name, (0, openapi_2.removeJsonSchemaProps)(schema));
        });
    }
    respondWithValidation(status, res, schema, data, headers = {}) {
        const errors = (0, validate_1.validateSchema)(schema, data);
        if (errors) {
            this.logger.debug('Invalid response:', JSON.stringify(errors, null, 4));
            if (this.flagResolver.isEnabled('strictSchemaValidation')) {
                throw new Error(JSON.stringify(errors, null, 4));
            }
        }
        Object.entries(headers).forEach(([header, value]) => res.header(header, value));
        res.status(status).json(data);
    }
}
exports.OpenApiService = OpenApiService;
//# sourceMappingURL=openapi-service.js.map