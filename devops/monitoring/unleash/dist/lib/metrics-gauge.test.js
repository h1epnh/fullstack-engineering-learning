"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prom_client_1 = require("prom-client");
const test_config_1 = require("../test/config/test-config");
const metrics_gauge_1 = require("./metrics-gauge");
const prometheusRegister = prom_client_1.register;
let config;
let dbMetrics;
beforeAll(async () => {
    config = (0, test_config_1.createTestConfig)({
        server: {
            serverMetrics: true,
        },
    });
});
beforeEach(async () => {
    dbMetrics = new metrics_gauge_1.DbMetricsMonitor(config);
});
test('should collect registered metrics', async () => {
    dbMetrics.registerGaugeDbMetric({
        name: 'my_metric',
        help: 'This is the answer to life, the univers, and everything',
        labelNames: [],
        query: () => Promise.resolve(42),
        map: (result) => ({ value: result }),
    });
    await dbMetrics.refreshMetrics();
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/my_metric 42/);
});
test('should collect registered metrics with labels', async () => {
    dbMetrics.registerGaugeDbMetric({
        name: 'life_the_universe_and_everything',
        help: 'This is the answer to life, the univers, and everything',
        labelNames: ['test'],
        query: () => Promise.resolve(42),
        map: (result) => ({ value: result, labels: { test: 'case' } }),
    });
    await dbMetrics.refreshMetrics();
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/life_the_universe_and_everything\{test="case"\} 42/);
});
test('should collect multiple registered metrics with and without labels', async () => {
    dbMetrics.registerGaugeDbMetric({
        name: 'my_first_metric',
        help: 'This is the answer to life, the univers, and everything',
        labelNames: [],
        query: () => Promise.resolve(42),
        map: (result) => ({ value: result }),
    });
    dbMetrics.registerGaugeDbMetric({
        name: 'my_other_metric',
        help: 'This is Eulers number',
        labelNames: ['euler'],
        query: () => Promise.resolve(Math.E),
        map: (result) => ({ value: result, labels: { euler: 'number' } }),
    });
    await dbMetrics.refreshMetrics();
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/my_first_metric 42/);
    expect(metrics).toMatch(/my_other_metric\{euler="number"\} 2.71828/);
});
test('should support different label and value pairs', async () => {
    dbMetrics.registerGaugeDbMetric({
        name: 'multi_dimensional',
        help: 'This metric has different values for different labels',
        labelNames: ['version', 'range'],
        query: () => Promise.resolve(2),
        map: (result) => [
            { value: result, labels: { version: '1', range: 'linear' } },
            {
                value: result * result,
                labels: { version: '2', range: 'square' },
            },
            { value: result / 2, labels: { version: '3', range: 'half' } },
        ],
    });
    await dbMetrics.refreshMetrics();
    const metrics = await prometheusRegister.metrics();
    expect(metrics).toMatch(/multi_dimensional\{version="1",range="linear"\} 2\nmulti_dimensional\{version="2",range="square"\} 4\nmulti_dimensional\{version="3",range="half"\} 1/);
    expect(await dbMetrics.findValue('multi_dimensional', { range: 'linear' })).toBe(2);
    expect(await dbMetrics.findValue('multi_dimensional', { range: 'half' })).toBe(1);
    expect(await dbMetrics.findValue('multi_dimensional', { range: 'square' })).toBe(4);
    expect(await dbMetrics.findValue('multi_dimensional', { range: 'x' })).toBeUndefined();
    expect(await dbMetrics.findValue('multi_dimensional')).toBe(2); // first match
    expect(await dbMetrics.findValue('other')).toBeUndefined();
});
//# sourceMappingURL=metrics-gauge.test.js.map