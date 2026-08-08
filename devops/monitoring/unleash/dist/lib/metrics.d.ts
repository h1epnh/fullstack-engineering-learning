import type EventEmitter from 'events';
import type { Knex } from 'knex';
import type { IUnleashConfig } from './types/option';
import type { IUnleashStores } from './types/stores';
import type { InstanceStatsService } from './features/instance-stats/instance-stats-service';
import type { SchedulerService } from './services';
export declare function registerPrometheusPostgresMetrics(db: Knex, eventBus: EventEmitter, postgresVersion: string): void;
export declare function registerPrometheusMetrics(config: IUnleashConfig, stores: IUnleashStores, version: string, eventBus: EventEmitter, instanceStatsService: InstanceStatsService): {
    collectAggDbMetrics: () => Promise<void>;
    collectStaticCounters: () => Promise<void>;
};
export default class MetricsMonitor {
    constructor();
    startMonitoring(config: IUnleashConfig, stores: IUnleashStores, version: string, eventBus: EventEmitter, instanceStatsService: InstanceStatsService, schedulerService: SchedulerService, db: Knex): Promise<void>;
    registerPoolMetrics(pool: any, eventBus: EventEmitter): void;
}
export declare function createMetricsMonitor(): MetricsMonitor;
//# sourceMappingURL=metrics.d.ts.map