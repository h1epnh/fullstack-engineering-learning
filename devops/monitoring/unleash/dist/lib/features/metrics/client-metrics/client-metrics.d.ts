import type { Request, Response } from 'express';
import Controller from '../../../routes/controller';
import type { IUnleashConfig } from '../../../types/option';
import type { IUnleashServices } from '../../../types';
import { type FeatureUsageSchema } from '../../../openapi/spec/feature-usage-schema';
import { type FeatureMetricsSchema } from '../../../openapi/spec/feature-metrics-schema';
interface IName {
    name: string;
}
interface IHoursBack {
    hoursBack: number;
}
declare class ClientMetricsController extends Controller {
    private logger;
    private metrics;
    private openApiService;
    private flagResolver;
    private static HOURS_BACK_MIN;
    private static HOURS_BACK_MAX;
    private static HOURS_BACK_MAX_V2;
    constructor(config: IUnleashConfig, { clientMetricsServiceV2, openApiService, }: Pick<IUnleashServices, 'clientMetricsServiceV2' | 'openApiService'>);
    getRawToggleMetrics(req: Request<any, IName, IHoursBack, any>, res: Response<FeatureMetricsSchema>): Promise<void>;
    getToggleMetricsSummary(req: Request<IName>, res: Response<FeatureUsageSchema>): Promise<void>;
    private parseHoursBackQueryParam;
}
export default ClientMetricsController;
//# sourceMappingURL=client-metrics.d.ts.map