import type { DeltaEvent } from './client-feature-toggle-delta';
import { type DeltaHydrationEvent } from './client-feature-toggle-delta-types';
export declare class DeltaCache {
    private events;
    private maxLength;
    private hydrationEvent;
    constructor(hydrationEvent: DeltaHydrationEvent, maxLength?: number);
    private addBaseEventFromHydration;
    addEvents(events: DeltaEvent[]): void;
    getEvents(): DeltaEvent[];
    isMissingRevision(revisionId: number): boolean;
    getHydrationEvent(): DeltaHydrationEvent;
    private updateHydrationEvent;
}
//# sourceMappingURL=delta-cache.d.ts.map