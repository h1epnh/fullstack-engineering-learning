import type { ClientFeatureSchema } from '../../../openapi';
import type { IClientSegment } from '../../../types';
export type DeltaHydrationEvent = {
    eventId: number;
    type: 'hydration';
    features: ClientFeatureSchema[];
    segments: IClientSegment[];
};
export type DeltaEvent = {
    eventId: number;
    type: 'feature-updated';
    feature: ClientFeatureSchema;
} | {
    eventId: number;
    type: 'feature-removed';
    featureName: string;
    project: string;
} | {
    eventId: number;
    type: 'segment-updated';
    segment: IClientSegment;
} | {
    eventId: number;
    type: 'segment-removed';
    segmentId: number;
};
export declare const DELTA_EVENT_TYPES: {
    readonly FEATURE_UPDATED: "feature-updated";
    readonly FEATURE_REMOVED: "feature-removed";
    readonly SEGMENT_UPDATED: "segment-updated";
    readonly SEGMENT_REMOVED: "segment-removed";
    readonly HYDRATION: "hydration";
};
export declare const isDeltaFeatureUpdatedEvent: (event: DeltaEvent) => event is Extract<DeltaEvent, {
    type: "feature-updated";
}>;
export declare const isDeltaFeatureRemovedEvent: (event: DeltaEvent) => event is Extract<DeltaEvent, {
    type: "feature-removed";
}>;
export declare const isDeltaSegmentEvent: (event: DeltaEvent) => event is Extract<DeltaEvent, {
    type: "segment-updated";
}>;
//# sourceMappingURL=client-feature-toggle-delta-types.d.ts.map