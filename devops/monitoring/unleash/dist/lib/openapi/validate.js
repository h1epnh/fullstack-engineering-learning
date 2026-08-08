"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwOnInvalidSchema = exports.validateSchema = exports.addAjvSchema = void 0;
const ajv_1 = __importDefault(require("ajv"));
const index_1 = require("./index");
const omit_keys_1 = require("../util/omit-keys");
const bad_data_error_1 = require("../error/bad-data-error");
const ajv = new ajv_1.default({
    schemas: Object.values(index_1.schemas).map((schema) => (0, omit_keys_1.omitKeys)(schema, 'components')),
    // example was superseded by examples in openapi 3.1, but we're still on 3.0, so
    // let's add it back in!
    keywords: ['example', 'x-enforcer-exception-skip-codes'],
    formats: {
        'date-time': true,
        date: true,
        uri: true,
    },
});
const addAjvSchema = (schemaObjects) => {
    const newSchemas = schemaObjects.filter((schema) => !ajv.getSchema(schema.$id));
    return ajv.addSchema(newSchemas);
};
exports.addAjvSchema = addAjvSchema;
const validateSchema = (schema, data) => {
    // @ts-expect-error we validate that we have an $id field, AJV apparently does not think this is enough to be willing to validate.
    if (!ajv.validate(schema, data)) {
        return {
            schema,
            errors: ajv.errors ?? [],
        };
    }
};
exports.validateSchema = validateSchema;
const throwOnInvalidSchema = (schema, data) => {
    const validationErrors = (0, exports.validateSchema)(schema, data);
    if (validationErrors) {
        const [firstError, ...remainingErrors] = validationErrors.errors;
        throw (0, bad_data_error_1.fromOpenApiValidationErrors)(data, [
            firstError,
            ...remainingErrors,
        ]);
    }
};
exports.throwOnInvalidSchema = throwOnInvalidSchema;
//# sourceMappingURL=validate.js.map