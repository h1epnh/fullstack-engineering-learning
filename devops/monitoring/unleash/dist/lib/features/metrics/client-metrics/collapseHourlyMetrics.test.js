"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collapseHourlyMetrics_1 = require("./collapseHourlyMetrics");
const date_fns_1 = require("date-fns");
test('collapseHourlyMetrics', () => {
    const timestamp = (0, date_fns_1.startOfHour)(new Date());
    const metricAX1 = {
        featureName: 'a',
        appName: 'x',
        environment: 'x',
        timestamp: (0, date_fns_1.addMinutes)(timestamp, 1),
        yes: 1,
        no: 11,
    };
    const metricAX2 = {
        featureName: 'a',
        appName: 'x',
        environment: 'x',
        timestamp: (0, date_fns_1.addMinutes)(timestamp, 2),
        yes: 2,
        no: 12,
    };
    const metricBX = {
        featureName: 'b',
        appName: 'x',
        environment: 'x',
        timestamp: (0, date_fns_1.addMinutes)(timestamp, 3),
        yes: 101,
        no: 1001,
    };
    const metricBY = {
        featureName: 'b',
        appName: 'y',
        environment: 'y',
        timestamp: (0, date_fns_1.addMinutes)(timestamp, 4),
        yes: 102,
        no: 1002,
    };
    expect((0, collapseHourlyMetrics_1.collapseHourlyMetrics)([metricAX1, metricAX2, metricBX, metricBY])).toEqual([
        {
            featureName: 'a',
            appName: 'x',
            environment: 'x',
            timestamp,
            yes: 3,
            no: 23,
        },
        {
            featureName: 'b',
            appName: 'x',
            environment: 'x',
            timestamp,
            yes: 101,
            no: 1001,
        },
        {
            featureName: 'b',
            appName: 'y',
            environment: 'y',
            timestamp,
            yes: 102,
            no: 1002,
        },
    ]);
    expect((0, collapseHourlyMetrics_1.collapseHourlyMetrics)([
        metricAX1,
        metricAX1,
        metricAX2,
        metricAX2,
        metricBX,
        metricBX,
        metricBY,
        metricBY,
    ])).toEqual([
        {
            featureName: 'a',
            appName: 'x',
            environment: 'x',
            timestamp,
            yes: 6,
            no: 46,
        },
        {
            featureName: 'b',
            appName: 'x',
            environment: 'x',
            timestamp,
            yes: 202,
            no: 2002,
        },
        {
            featureName: 'b',
            appName: 'y',
            environment: 'y',
            timestamp,
            yes: 204,
            no: 2004,
        },
    ]);
});
test('collapseHourlyMetrics variants', () => {
    const timestamp = (0, date_fns_1.startOfHour)(new Date());
    const metricsWithoutVariant = {
        featureName: 'a',
        appName: 'x',
        environment: 'x',
        timestamp: (0, date_fns_1.addMinutes)(timestamp, 1),
        yes: 1,
        no: 11,
    };
    const metricsWithVariant1 = {
        featureName: 'a',
        appName: 'x',
        environment: 'x',
        timestamp: (0, date_fns_1.addMinutes)(timestamp, 2),
        yes: 2,
        no: 12,
        variants: { disabled: 3, red: 2 },
    };
    const metricsWithVariant2 = {
        featureName: 'a',
        appName: 'x',
        environment: 'x',
        timestamp: (0, date_fns_1.addMinutes)(timestamp, 2),
        yes: 2,
        no: 12,
        variants: { disabled: 1, red: 3 },
    };
    expect((0, collapseHourlyMetrics_1.collapseHourlyMetrics)([
        metricsWithoutVariant,
        metricsWithVariant1,
        metricsWithVariant2,
    ])).toEqual([
        {
            featureName: 'a',
            appName: 'x',
            environment: 'x',
            timestamp,
            yes: 5,
            no: 35,
            variants: { disabled: 4, red: 5 },
        },
    ]);
});
//# sourceMappingURL=collapseHourlyMetrics.test.js.map