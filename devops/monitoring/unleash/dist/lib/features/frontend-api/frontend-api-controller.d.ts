import Controller from '../../routes/controller';
import { type IUnleashConfig, type IUnleashServices } from '../../types';
type Services = Pick<IUnleashServices, 'settingService' | 'frontendApiService' | 'openApiService'>;
export default class FrontendAPIController extends Controller {
    private readonly logger;
    private services;
    private timer;
    constructor(config: IUnleashConfig, services: Services);
    private static endpointNotImplemented;
    private getFrontendApiFeatures;
    private registerFrontendApiMetrics;
    private registerFrontendApiClient;
    private static createContext;
}
export {};
//# sourceMappingURL=frontend-api-controller.d.ts.map