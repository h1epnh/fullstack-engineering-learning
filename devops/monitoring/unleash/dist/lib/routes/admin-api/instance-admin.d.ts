import type { Response } from 'express';
import type { AuthedRequest } from '../../types/core';
import type { IUnleashServices } from '../../types/services';
import type { IUnleashConfig } from '../../types/option';
import Controller from '../controller';
import type { InstanceStatsSigned } from '../../features/instance-stats/instance-stats-service';
import type { InstanceAdminStatsSchema } from '../../openapi';
declare class InstanceAdminController extends Controller {
    private instanceStatsService;
    private openApiService;
    private jsonCsvParser;
    constructor(config: IUnleashConfig, { instanceStatsService, openApiService, }: Pick<IUnleashServices, 'instanceStatsService' | 'openApiService'>);
    instanceStatsExample(): InstanceStatsSigned;
    private serializeStats;
    getStatistics(_: AuthedRequest, res: Response<InstanceAdminStatsSchema>): Promise<void>;
    getStatisticsCSV(_: AuthedRequest, res: Response<InstanceAdminStatsSchema>): Promise<void>;
}
export default InstanceAdminController;
//# sourceMappingURL=instance-admin.d.ts.map