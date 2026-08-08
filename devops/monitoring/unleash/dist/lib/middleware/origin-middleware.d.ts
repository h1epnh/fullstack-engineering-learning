import type { Request, Response, NextFunction } from 'express';
import type { IUnleashConfig } from '../types';
export declare const originMiddleware: ({ getLogger, eventBus, flagResolver, }: Pick<IUnleashConfig, "getLogger" | "eventBus" | "flagResolver">) => (req: Request, _: Response, next: NextFunction) => void;
//# sourceMappingURL=origin-middleware.d.ts.map