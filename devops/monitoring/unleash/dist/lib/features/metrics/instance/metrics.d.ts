import type { Response } from 'express';
import Controller from '../../../routes/controller';
import { type IFlagResolver, type IUnleashConfig, type IUnleashServices } from '../../../types';
import type ClientInstanceService from './instance-service';
import type { Logger } from '../../../logger';
import type { IAuthRequest } from '../../../routes/unleash-types';
import type ClientMetricsServiceV2 from '../client-metrics/metrics-service-v2';
import type { OpenApiService } from '../../../services/openapi-service';
import type { BulkMetricsSchema } from '../../../openapi/spec/bulk-metrics-schema';
export default class ClientMetricsController extends Controller {
    logger: Logger;
    clientInstanceService: ClientInstanceService;
    openApiService: OpenApiService;
    metricsV2: ClientMetricsServiceV2;
    flagResolver: IFlagResolver;
    constructor({ clientInstanceService, clientMetricsServiceV2, openApiService, }: Pick<IUnleashServices, 'clientInstanceService' | 'clientMetricsServiceV2' | 'openApiService'>, config: IUnleashConfig);
    registerMetrics(req: IAuthRequest, res: Response): Promise<void>;
    bulkMetrics(req: IAuthRequest<void, void, BulkMetricsSchema>, res: Response<void>): Promise<void>;
}
//# sourceMappingURL=metrics.d.ts.map