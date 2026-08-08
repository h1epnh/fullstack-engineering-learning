"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordUiErrorSchema = void 0;
exports.recordUiErrorSchema = {
    $id: '#/components/schemas/recordUiErrorSchema',
    type: 'object',
    components: {},
    required: ['errorMessage'],
    description: 'An object representing an error from the UI',
    properties: {
        errorMessage: {
            type: 'string',
            description: 'The error message',
        },
        errorStack: {
            type: 'string',
            description: 'The stack trace of the error',
        },
    },
};
//# sourceMappingURL=record-ui-error-schema.js.map