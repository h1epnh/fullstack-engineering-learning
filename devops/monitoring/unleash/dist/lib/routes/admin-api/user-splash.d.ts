import Controller from '../controller';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
declare class UserSplashController extends Controller {
    private logger;
    private userSplashService;
    private openApiService;
    constructor(config: IUnleashConfig, { userSplashService, openApiService, }: Pick<IUnleashServices, 'userSplashService' | 'openApiService'>);
    private updateSplashSettings;
}
export default UserSplashController;
//# sourceMappingURL=user-splash.d.ts.map