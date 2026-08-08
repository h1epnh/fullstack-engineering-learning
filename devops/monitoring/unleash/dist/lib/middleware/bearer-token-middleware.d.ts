import type { Request, Response, NextFunction } from 'express';
import type { IUnleashConfig } from '../types';
export declare const bearerTokenMiddleware: ({ getLogger, }: Pick<IUnleashConfig, "getLogger">) => (req: Request, _: Response, next: NextFunction) => void;
//# sourceMappingURL=bearer-token-middleware.d.ts.map