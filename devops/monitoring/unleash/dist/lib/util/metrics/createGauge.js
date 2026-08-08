"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGauge = void 0;
const prom_client_1 = require("prom-client");
/**
 * Creates a wrapped instance of prom-client's Gauge, overriding some of its methods for enhanced functionality and type-safety.
 *
 * @param options - The configuration options for the Gauge, as defined in prom-client's GaugeConfiguration.
 *               See prom-client documentation for detailed options: https://github.com/siimon/prom-client#gauge
 * @returns An object containing the wrapped Gauge instance and custom methods.
 */
const createGauge = (options) => {
    /**
     * The underlying instance of prom-client's Gauge.
     */
    const gauge = new prom_client_1.Gauge(options);
    /**
     * Applies given labels to the gauge. Labels are key-value pairs.
     * This method wraps the original Gauge's labels method for additional type-safety, requiring all configured labels to be specified.
     *
     * @param labels - An object where keys are label names and values are the label values.
     * @returns The Gauge instance with the applied labels, allowing for method chaining.
     */
    const labels = (labels) => gauge.labels(labels);
    /**
     * Resets the gauge value.
     * Wraps the original Gauge's reset method.
     */
    const reset = () => gauge.reset();
    /**
     * Sets the gauge to a specified value.
     * Wraps the original Gauge's set method.
     *
     * @param value - The value to set the gauge to.
     */
    const set = (value) => gauge.set(value);
    return {
        gauge,
        labels,
        reset,
        set,
    };
};
exports.createGauge = createGauge;
//# sourceMappingURL=createGauge.js.map