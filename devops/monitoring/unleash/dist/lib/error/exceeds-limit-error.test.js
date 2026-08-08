"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const metric_events_1 = require("../metric-events");
const exceeds_limit_error_1 = require("./exceeds-limit-error");
it('emits events event when created through the external function', () => {
    const emitEvent = jest.fn();
    const resource = 'some-resource';
    const limit = 10;
    expect(() => (0, exceeds_limit_error_1.throwExceedsLimitError)({
        emit: emitEvent,
    }, {
        resource,
        limit,
    })).toThrow(exceeds_limit_error_1.ExceedsLimitError);
    expect(emitEvent).toHaveBeenCalledWith(metric_events_1.EXCEEDS_LIMIT, {
        resource,
        limit,
    });
});
it('emits uses the resourceNameOverride for the event when provided, but uses the resource for the error', () => {
    const emitEvent = jest.fn();
    const resource = 'not this';
    const resourceNameOverride = 'but this!';
    const limit = 10;
    expect(() => (0, exceeds_limit_error_1.throwExceedsLimitError)({
        emit: emitEvent,
    }, {
        resource,
        resourceNameOverride,
        limit,
    })).toThrow(new exceeds_limit_error_1.ExceedsLimitError(resource, limit));
    expect(emitEvent).toHaveBeenCalledWith(metric_events_1.EXCEEDS_LIMIT, {
        resource: resourceNameOverride,
        limit,
    });
});
//# sourceMappingURL=exceeds-limit-error.test.js.map