"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDeltaSegmentEvent = exports.isDeltaFeatureRemovedEvent = exports.isDeltaFeatureUpdatedEvent = exports.DELTA_EVENT_TYPES = void 0;
exports.DELTA_EVENT_TYPES = {
    FEATURE_UPDATED: 'feature-updated',
    FEATURE_REMOVED: 'feature-removed',
    SEGMENT_UPDATED: 'segment-updated',
    SEGMENT_REMOVED: 'segment-removed',
    HYDRATION: 'hydration',
};
const isDeltaFeatureUpdatedEvent = (event) => {
    return event.type === exports.DELTA_EVENT_TYPES.FEATURE_UPDATED;
};
exports.isDeltaFeatureUpdatedEvent = isDeltaFeatureUpdatedEvent;
const isDeltaFeatureRemovedEvent = (event) => {
    return event.type === exports.DELTA_EVENT_TYPES.FEATURE_REMOVED;
};
exports.isDeltaFeatureRemovedEvent = isDeltaFeatureRemovedEvent;
const isDeltaSegmentEvent = (event) => {
    return (event.type === exports.DELTA_EVENT_TYPES.SEGMENT_UPDATED ||
        event.type === exports.DELTA_EVENT_TYPES.SEGMENT_REMOVED);
};
exports.isDeltaSegmentEvent = isDeltaSegmentEvent;
//# sourceMappingURL=client-feature-toggle-delta-types.js.map