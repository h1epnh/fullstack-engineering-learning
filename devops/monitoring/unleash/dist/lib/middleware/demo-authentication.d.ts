import type { Application } from 'express';
import type { IUnleashServices } from '../types/services';
import type { IUnleashConfig } from '../types/option';
declare function demoAuthentication(app: Application, basePath: string, { userService }: Pick<IUnleashServices, 'userService'>, { authentication, flagResolver, }: Pick<IUnleashConfig, 'authentication' | 'flagResolver'>): void;
export default demoAuthentication;
//# sourceMappingURL=demo-authentication.d.ts.map