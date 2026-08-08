import type { RequestHandler } from 'express';
import type { IUnleashConfig, IUnleashServices } from '../types';
export declare const resolveOrigin: (allowedOrigins: string[]) => string | string[];
export declare const corsOriginMiddleware: ({ frontendApiService }: Pick<IUnleashServices, "frontendApiService">, config: IUnleashConfig) => RequestHandler;
//# sourceMappingURL=cors-origin-middleware.d.ts.map