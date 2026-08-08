"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwExceedsLimitError = exports.ExceedsLimitError = void 0;
const unleash_error_1 = require("./unleash-error");
const metric_events_1 = require("../metric-events");
class ExceedsLimitError extends unleash_error_1.GenericUnleashError {
    constructor(resource, limit) {
        super({
            name: 'ExceedsLimitError',
            message: `Failed to create ${resource}. You can't create more than the established limit of ${limit}.`,
            statusCode: 400,
        });
    }
}
exports.ExceedsLimitError = ExceedsLimitError;
const throwExceedsLimitError = (eventBus, { resource, limit, resourceNameOverride }) => {
    eventBus.emit(metric_events_1.EXCEEDS_LIMIT, {
        resource: resourceNameOverride ?? resource,
        limit,
    });
    throw new ExceedsLimitError(resource, limit);
};
exports.throwExceedsLimitError = throwExceedsLimitError;
//# sourceMappingURL=exceeds-limit-error.js.map