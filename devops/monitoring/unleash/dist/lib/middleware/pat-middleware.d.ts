import type { IUnleashConfig } from '../types';
import type { AccountService } from '../services/account-service';
declare const patMiddleware: ({ getLogger }: Pick<IUnleashConfig, "getLogger">, { accountService }: {
    accountService: AccountService;
}) => any;
export default patMiddleware;
//# sourceMappingURL=pat-middleware.d.ts.map