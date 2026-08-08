"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbMetricsMonitor = void 0;
const metrics_1 = require("./util/metrics");
class DbMetricsMonitor {
    constructor({ getLogger }) {
        this.updaters = new Map();
        this.refreshMetrics = async () => {
            const tasks = Array.from(this.updaters.entries()).map(([name, updater]) => ({ name, task: updater.task }));
            for (const { name, task } of tasks) {
                this.log.debug(`Refreshing metric ${name}`);
                await task();
            }
        };
        this.log = getLogger('gauge-metrics');
    }
    asArray(value) {
        return Array.isArray(value) ? value : [value];
    }
    async fetch(definition) {
        const result = await definition.query();
        if (result !== undefined &&
            result !== null &&
            (!Array.isArray(result) || result.length > 0)) {
            const resultArray = this.asArray(definition.map(result));
            resultArray
                .filter((r) => typeof r.value !== 'number')
                .forEach((r) => {
                this.log.debug(`Invalid value for ${definition.name}: ${r.value}. Value must be an number.`);
            });
            return resultArray.filter((r) => typeof r.value === 'number');
        }
        return [];
    }
    registerGaugeDbMetric(definition) {
        const gauge = (0, metrics_1.createGauge)(definition);
        const task = async () => {
            try {
                const results = await this.fetch(definition);
                if (results.length > 0) {
                    gauge.reset();
                    for (const r of results) {
                        // when r.value is zero, we are writing a zero value to the gauge which might not be what we want in some cases
                        if (r.labels) {
                            gauge.labels(r.labels).set(r.value);
                        }
                        else {
                            gauge.set(r.value);
                        }
                    }
                }
            }
            catch (e) {
                this.log.warn(`Failed to refresh ${definition.name}`, e);
            }
        };
        this.updaters.set(definition.name, { target: gauge, task });
        return task;
    }
    async findValue(name, labels) {
        const gauge = await this.updaters.get(name)?.target.gauge?.get();
        if (gauge && gauge.values.length > 0) {
            const values = labels
                ? gauge.values.filter(({ labels: l }) => {
                    return Object.entries(labels).every(([key, value]) => l[key] === value);
                })
                : gauge.values;
            // return first value
            return values.map(({ value }) => value).shift();
        }
        return undefined;
    }
}
exports.DbMetricsMonitor = DbMetricsMonitor;
//# sourceMappingURL=metrics-gauge.js.map