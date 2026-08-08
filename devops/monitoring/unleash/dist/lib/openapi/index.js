"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOpenApiSchema = exports.removeJsonSchemaProps = exports.schemas = void 0;
const util_1 = require("../util");
const util_2 = require("./util");
const url_1 = require("url");
const version_1 = __importDefault(require("../util/version"));
/*
 * All schemas in `openapi/spec` should be listed here.
 * Instead of listing them all maunally, exclude those that are not schemas (maybe they should be moved elsewhere)
 */
const importedSchemas = __importStar(require("./spec"));
const { constraintSchemaBase, unknownFeatureEvaluationResult, playgroundStrategyEvaluation, strategyEvaluationResults, ...exportedSchemas } = importedSchemas;
exports.schemas = exportedSchemas;
// Remove JSONSchema keys that would result in an invalid OpenAPI spec.
const removeJsonSchemaProps = (schema) => {
    return (0, util_1.omitKeys)(schema, '$id', 'components');
};
exports.removeJsonSchemaProps = removeJsonSchemaProps;
const findRootUrl = (unleashUrl, baseUriPath) => {
    if (!baseUriPath) {
        return unleashUrl;
    }
    const baseUrl = new url_1.URL(unleashUrl);
    const url = baseUrl.pathname.indexOf(baseUriPath) >= 0
        ? `${baseUrl.protocol}//${baseUrl.host}`
        : baseUrl.toString();
    return baseUriPath.startsWith('/')
        ? new url_1.URL(baseUriPath, url).toString()
        : url;
};
const createOpenApiSchema = ({ unleashUrl, baseUriPath, }) => {
    const url = findRootUrl(unleashUrl, baseUriPath);
    return {
        openapi: '3.0.3',
        servers: baseUriPath ? [{ url }] : [],
        info: {
            title: 'Unleash API',
            version: version_1.default,
        },
        security: [{ apiKey: [] }, { bearerToken: [] }],
        components: {
            securitySchemes: {
                // https://swagger.io/docs/specification/authentication/api-keys/
                apiKey: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                    description: 'API key needed to access this API',
                },
                // https://swagger.io/docs/specification/authentication/bearer-authentication/
                bearerToken: {
                    type: 'http',
                    scheme: 'bearer',
                    description: 'API key needed to access this API, in Bearer token format',
                },
            },
            schemas: (0, util_1.mapValues)(exports.schemas, exports.removeJsonSchemaProps),
        },
        tags: util_2.openApiTags,
    };
};
exports.createOpenApiSchema = createOpenApiSchema;
__exportStar(require("./util"), exports);
__exportStar(require("./spec"), exports);
//# sourceMappingURL=index.js.map