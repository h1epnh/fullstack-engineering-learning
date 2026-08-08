import { FrontendApiService } from './frontend-api-service';
import type ClientMetricsServiceV2 from '../metrics/client-metrics/metrics-service-v2';
import type ConfigurationRevisionService from '../feature-toggle/configuration-revision-service';
import type { IUnleashConfig } from '../../types';
import type { Db } from '../../db/db';
export declare const createFrontendApiService: (db: Db, config: IUnleashConfig, clientMetricsServiceV2: ClientMetricsServiceV2, configurationRevisionService: ConfigurationRevisionService) => FrontendApiService;
export declare const createFakeFrontendApiService: (config: IUnleashConfig, clientMetricsServiceV2: ClientMetricsServiceV2, configurationRevisionService: ConfigurationRevisionService) => FrontendApiService;
//# sourceMappingURL=createFrontendApiService.d.ts.map