import { Summary as PromSummary, type SummaryConfiguration } from 'prom-client';
/**
 * A wrapped instance of prom-client's Summary, overriding some of its methods for enhanced functionality and type-safety.
 */
export type Summary<T extends string = string> = {
    summary: PromSummary<T>;
    labels: (labels: Record<T, string | number>) => PromSummary.Internal<T>;
    observe: (value: number) => void;
};
/**
 * Creates a wrapped instance of prom-client's Summary, overriding some of its methods for enhanced functionality and type-safety.
 *
 * @param options - The configuration options for the Summary, as defined in prom-client's SummaryConfiguration.
 *               See prom-client documentation for detailed options: https://github.com/siimon/prom-client#summary
 * @returns An object containing the wrapped Summary instance and custom methods.
 */
export declare const createSummary: <T extends string>(options: SummaryConfiguration<T>) => Summary<T>;
//# sourceMappingURL=createSummary.d.ts.map