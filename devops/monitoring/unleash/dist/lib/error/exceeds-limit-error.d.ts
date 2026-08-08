import { GenericUnleashError } from './unleash-error';
import type EventEmitter from 'events';
export declare class ExceedsLimitError extends GenericUnleashError {
    constructor(resource: string, limit: number);
}
type ExceedsLimitErrorData = {
    resource: string;
    limit: number;
    resourceNameOverride?: string;
};
export declare const throwExceedsLimitError: (eventBus: EventEmitter, { resource, limit, resourceNameOverride }: ExceedsLimitErrorData) => never;
export {};
//# sourceMappingURL=exceeds-limit-error.d.ts.map