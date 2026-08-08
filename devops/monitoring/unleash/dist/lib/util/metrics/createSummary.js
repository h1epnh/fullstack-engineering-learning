"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSummary = void 0;
const prom_client_1 = require("prom-client");
/**
 * Creates a wrapped instance of prom-client's Summary, overriding some of its methods for enhanced functionality and type-safety.
 *
 * @param options - The configuration options for the Summary, as defined in prom-client's SummaryConfiguration.
 *               See prom-client documentation for detailed options: https://github.com/siimon/prom-client#summary
 * @returns An object containing the wrapped Summary instance and custom methods.
 */
const createSummary = (options) => {
    /**
     * The underlying instance of prom-client's Summary.
     */
    const summary = new prom_client_1.Summary(options);
    /**
     * Applies given labels to the summary. Labels are key-value pairs.
     * This method wraps the original Summary's labels method for additional type-safety, requiring all configured labels to be specified.
     *
     * @param labels - An object where keys are label names and values are the label values.
     * @returns The Summary instance with the applied labels, allowing for method chaining.
     */
    const labels = (labels) => summary.labels(labels);
    /**
     * Observes a value in the summary.
     * Wraps the original Summary's observe method.
     *
     * @param value - The value to observe.
     */
    const observe = (value) => summary.observe(value);
    return {
        summary,
        labels,
        observe,
    };
};
exports.createSummary = createSummary;
//# sourceMappingURL=createSummary.js.map