"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeltaCache = void 0;
const client_feature_toggle_delta_types_1 = require("./client-feature-toggle-delta-types");
class DeltaCache {
    constructor(hydrationEvent, maxLength = 20) {
        this.events = [];
        this.hydrationEvent = hydrationEvent;
        this.maxLength = maxLength;
        this.addBaseEventFromHydration(hydrationEvent);
    }
    addBaseEventFromHydration(hydrationEvent) {
        const lastFeature = hydrationEvent.features[hydrationEvent.features.length - 1];
        this.addEvents([
            {
                eventId: hydrationEvent.eventId,
                type: 'feature-updated',
                feature: lastFeature,
            },
        ]);
    }
    addEvents(events) {
        this.events = [...this.events, ...events];
        this.updateHydrationEvent(events);
        while (this.events.length > this.maxLength) {
            this.events.shift();
        }
    }
    getEvents() {
        return this.events;
    }
    isMissingRevision(revisionId) {
        return !this.events.some((event) => event.eventId === revisionId);
    }
    getHydrationEvent() {
        return this.hydrationEvent;
    }
    updateHydrationEvent(events) {
        for (const appliedEvent of events) {
            switch (appliedEvent.type) {
                case client_feature_toggle_delta_types_1.DELTA_EVENT_TYPES.FEATURE_UPDATED: {
                    const featureIndex = this.hydrationEvent.features.findIndex((feature) => feature.name === appliedEvent.feature.name);
                    if (featureIndex > -1) {
                        this.hydrationEvent.features[featureIndex] =
                            appliedEvent.feature;
                    }
                    else {
                        this.hydrationEvent.features.push(appliedEvent.feature);
                    }
                    break;
                }
                case client_feature_toggle_delta_types_1.DELTA_EVENT_TYPES.FEATURE_REMOVED: {
                    this.hydrationEvent.features =
                        this.hydrationEvent.features.filter((feature) => feature.name !== appliedEvent.featureName);
                    break;
                }
                case client_feature_toggle_delta_types_1.DELTA_EVENT_TYPES.SEGMENT_UPDATED: {
                    const segmentIndex = this.hydrationEvent.segments.findIndex((segment) => segment.id === appliedEvent.segment.id);
                    if (segmentIndex > -1) {
                        this.hydrationEvent.segments[segmentIndex] =
                            appliedEvent.segment;
                    }
                    else {
                        this.hydrationEvent.segments.push(appliedEvent.segment);
                    }
                    break;
                }
                case client_feature_toggle_delta_types_1.DELTA_EVENT_TYPES.SEGMENT_REMOVED: {
                    this.hydrationEvent.segments =
                        this.hydrationEvent.segments.filter((segment) => segment.id !== appliedEvent.segmentId);
                    break;
                }
            }
            this.hydrationEvent.eventId = appliedEvent.eventId;
        }
    }
}
exports.DeltaCache = DeltaCache;
//# sourceMappingURL=delta-cache.js.map