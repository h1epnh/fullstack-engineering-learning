"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basePaginationParameters = void 0;
exports.basePaginationParameters = [
    {
        name: 'limit',
        schema: {
            type: 'string',
            example: '50',
        },
        description: 'The number of results to return in a page. By default it is set to 50.',
        in: 'query',
    },
    {
        name: 'offset',
        schema: {
            type: 'string',
            example: '50',
        },
        description: 'The number of results to skip when returning a page. By default it is set to 0.',
        in: 'query',
    },
];
//# sourceMappingURL=base-pagination-parameters.js.map