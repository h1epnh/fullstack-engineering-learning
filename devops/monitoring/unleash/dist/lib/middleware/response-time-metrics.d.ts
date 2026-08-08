import type EventEmitter from 'events';
import type { IFlagResolver } from '../types/experimental';
import type { InstanceStatsService } from '../services';
import type { RequestHandler } from 'express';
export declare const storeRequestedRoute: RequestHandler;
export declare function responseTimeMetrics(eventBus: EventEmitter, flagResolver: IFlagResolver, instanceStatsService: Pick<InstanceStatsService, 'getAppCountSnapshot'>): RequestHandler;
//# sourceMappingURL=response-time-metrics.d.ts.map