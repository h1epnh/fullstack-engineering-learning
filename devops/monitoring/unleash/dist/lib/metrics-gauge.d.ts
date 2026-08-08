import type { IUnleashConfig } from './types';
type Query<R> = () => Promise<R | undefined | null>;
type MetricValue<L extends string> = {
    value: number;
    labels?: Record<L, string | number>;
};
type MapResult<R, L extends string> = (result: R) => MetricValue<L> | MetricValue<L>[];
type GaugeDefinition<T, L extends string> = {
    name: string;
    help: string;
    labelNames?: L[];
    query: Query<T>;
    map: MapResult<T, L>;
};
type Task = () => Promise<void>;
export declare class DbMetricsMonitor {
    private updaters;
    private log;
    constructor({ getLogger }: Pick<IUnleashConfig, 'getLogger'>);
    private asArray;
    private fetch;
    registerGaugeDbMetric<T, L extends string>(definition: GaugeDefinition<T, L>): Task;
    refreshMetrics: () => Promise<void>;
    findValue(name: string, labels?: Record<string, string | number>): Promise<number | undefined>;
}
export {};
//# sourceMappingURL=metrics-gauge.d.ts.map