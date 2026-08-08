import joi from 'joi';
import type { IMetricsBucket } from '../../../types';
export type ValidatedClientMetrics = {
    environment?: string;
    appName: string;
    instanceId: string;
    bucket: IMetricsBucket;
};
export declare const clientMetricsSchema: joi.ObjectSchema<ValidatedClientMetrics>;
export declare const clientMetricsEnvSchema: joi.ObjectSchema<any>;
export declare const clientMetricsEnvBulkSchema: joi.ArraySchema<any[]>;
export declare const applicationSchema: joi.ObjectSchema<any>;
export declare const batchMetricsSchema: joi.ObjectSchema<any>;
export declare const clientRegisterSchema: joi.ObjectSchema<any>;
//# sourceMappingURL=schema.d.ts.map