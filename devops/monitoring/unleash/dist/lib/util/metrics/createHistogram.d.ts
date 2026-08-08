import { Histogram as PromHistogram, type HistogramConfiguration } from 'prom-client';
export type Histogram<T extends string = string> = {
    histogram: PromHistogram<T>;
    labels: (labels: Record<T, string | number>) => PromHistogram.Internal<T>;
    observe: (value: number) => void;
};
export declare const createHistogram: <T extends string>(options: HistogramConfiguration<T>) => Histogram<T>;
//# sourceMappingURL=createHistogram.d.ts.map