import type { Response } from 'express';
import { type IUnleashConfig } from '../types';
import Controller from './controller';
import type { IAuthRequest } from './unleash-types';
import type { IUnleashServices } from '../types';
declare class LogoutController extends Controller {
    private clearSiteDataOnLogout;
    private cookieName;
    private baseUri;
    private sessionService;
    constructor(config: IUnleashConfig, { sessionService }: Pick<IUnleashServices, 'sessionService'>);
    logout(req: IAuthRequest, res: Response): Promise<void>;
    private isReqLogoutWithoutCallback;
}
export default LogoutController;
//# sourceMappingURL=logout.d.ts.map