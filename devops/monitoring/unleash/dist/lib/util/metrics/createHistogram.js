"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHistogram = void 0;
const prom_client_1 = require("prom-client");
const createHistogram = (options) => {
    const histogram = new prom_client_1.Histogram(options);
    const labels = (labels) => histogram.labels(labels);
    const observe = (value) => histogram.observe(value);
    return {
        histogram,
        labels,
        observe,
    };
};
exports.createHistogram = createHistogram;
//# sourceMappingURL=createHistogram.js.map