import { Counter as PromCounter, type CounterConfiguration } from 'prom-client';
/**
 * A wrapped instance of prom-client's Counter, overriding some of its methods for enhanced functionality and type-safety.
 */
export type Counter<T extends string = string> = {
    counter: PromCounter<T>;
    labels: (labels: Record<T, string | number>) => PromCounter.Internal;
    inc: (value?: number | undefined) => void;
    increment: (labels: Record<T, string | number>, value?: number) => void;
};
/**
 * Creates a wrapped instance of prom-client's Counter, overriding some of its methods for enhanced functionality and type-safety.
 *
 * @param options - The configuration options for the Counter, as defined in prom-client's CounterConfiguration.
 *               See prom-client documentation for detailed options: https://github.com/siimon/prom-client#counter
 * @returns An object containing the wrapped Counter instance and custom methods.
 */
export declare const createCounter: <T extends string>(options: CounterConfiguration<T>) => Counter<T>;
//# sourceMappingURL=createCounter.d.ts.map