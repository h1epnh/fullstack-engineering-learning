import { Gauge as PromGauge, type GaugeConfiguration } from 'prom-client';
/**
 * A wrapped instance of prom-client's Gauge, overriding some of its methods for enhanced functionality and type-safety.
 */
export type Gauge<T extends string = string> = {
    gauge: PromGauge<T>;
    labels: (labels: Record<T, string | number>) => PromGauge.Internal<T>;
    reset: () => void;
    set: (value: number) => void;
};
/**
 * Creates a wrapped instance of prom-client's Gauge, overriding some of its methods for enhanced functionality and type-safety.
 *
 * @param options - The configuration options for the Gauge, as defined in prom-client's GaugeConfiguration.
 *               See prom-client documentation for detailed options: https://github.com/siimon/prom-client#gauge
 * @returns An object containing the wrapped Gauge instance and custom methods.
 */
export declare const createGauge: <T extends string>(options: GaugeConfiguration<T>) => Gauge<T>;
//# sourceMappingURL=createGauge.d.ts.map