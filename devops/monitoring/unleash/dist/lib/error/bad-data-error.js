"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromJoiError = exports.fromOpenApiValidationErrors = exports.fromOpenApiValidationError = void 0;
const lodash_get_1 = __importDefault(require("lodash.get"));
const unleash_error_1 = require("./unleash-error");
class BadDataError extends unleash_error_1.UnleashError {
    constructor(message, errors) {
        const topLevelMessage = `Request validation failed: your request body or params contain invalid data${errors
            ? '. Refer to the `details` list for more information.'
            : `: ${message}`}`;
        super(topLevelMessage);
        this.statusCode = 400;
        this.details = errors ?? [{ message: message }];
    }
    toJSON() {
        return {
            ...super.toJSON(),
            details: this.details,
        };
    }
}
exports.default = BadDataError;
const constructPath = (pathToParent, propertyName) => [pathToParent, propertyName].filter(Boolean).join('/');
const missingRequiredPropertyMessage = (pathToParentObject, missingPropertyName) => {
    const path = constructPath(pathToParentObject, missingPropertyName);
    const message = `The \`${path}\` property is required. It was not present on the data you sent.`;
    return {
        path,
        message,
    };
};
const additionalPropertiesMessage = (pathToParentObject, additionalPropertyName) => {
    const path = constructPath(pathToParentObject, additionalPropertyName);
    const message = `The ${pathToParentObject ? `\`${pathToParentObject}\`` : 'root'} object of the request body does not allow additional properties. Your request included the \`${path}\` property.`;
    return {
        path,
        message,
    };
};
const genericErrorMessage = (propertyName, propertyValue, errorMessage = 'is invalid') => {
    const youSent = JSON.stringify(propertyValue);
    const message = `The \`${propertyName}\` property ${errorMessage}. You sent ${youSent}.`;
    return {
        message,
        path: propertyName,
    };
};
const oneOfMessage = (propertyName, errorMessage = 'is invalid') => {
    const errorPosition = propertyName === '' ? 'root object' : `"${propertyName}" property`;
    const message = `The ${errorPosition} ${errorMessage}. The data you provided matches more than one option in the schema. These options are mutually exclusive. Please refer back to the schema and remove any excess properties.`;
    return {
        message,
        path: propertyName,
    };
};
const enumMessage = (propertyName, message, allowedValues, suppliedValue) => {
    const fullMessage = `The \`${propertyName}\` property ${message ?? 'must match one of the allowed values'}: ${allowedValues
        .map((value) => `"${value}"`)
        .join(', ')}. You provided "${suppliedValue}", which is not valid. Please use one of the allowed values instead..`;
    return {
        message: fullMessage,
        path: propertyName,
    };
};
const fromOpenApiValidationError = (data) => (validationError) => {
    const { instancePath, params, message } = validationError;
    const propertyValue = (0, lodash_get_1.default)(data, instancePath.split('/').filter(Boolean));
    switch (validationError.keyword) {
        case 'required':
            return missingRequiredPropertyMessage(instancePath, params.missingProperty);
        case 'additionalProperties':
            return additionalPropertiesMessage(instancePath, params.additionalProperty);
        case 'enum':
            return enumMessage(instancePath.substring(instancePath.lastIndexOf('/') + 1), message, params.allowedValues, propertyValue);
        case 'oneOf':
            return oneOfMessage(instancePath, validationError.message);
        default:
            return genericErrorMessage(instancePath, propertyValue, message);
    }
};
exports.fromOpenApiValidationError = fromOpenApiValidationError;
const fromOpenApiValidationErrors = (data, validationErrors) => {
    const [firstDetail, ...remainingDetails] = validationErrors.map((0, exports.fromOpenApiValidationError)(data));
    return new BadDataError("Request validation failed: your request doesn't conform to the schema. Check the `details` property for a list of errors that we found.", [firstDetail, ...remainingDetails]);
};
exports.fromOpenApiValidationErrors = fromOpenApiValidationErrors;
const fromJoiError = (err) => {
    const details = err.details.map((detail) => {
        const messageEnd = detail.context?.value
            ? `. You provided ${JSON.stringify(detail.context.value)}.`
            : '.';
        const message = detail.message + messageEnd;
        return {
            message,
        };
    });
    const [first, ...rest] = details;
    if (first) {
        return new BadDataError('A validation error occurred while processing your request data. Refer to the `details` property for more information.', [first, ...rest]);
    }
    else {
        return new BadDataError('A validation error occurred while processing your request data. Please make sure it conforms to the request data schema.');
    }
};
exports.fromJoiError = fromJoiError;
//# sourceMappingURL=bad-data-error.js.map