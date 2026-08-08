import type { IUnleashConfig } from '../types/option';
import type { IUnleashStores } from '../types/stores';
import type User from '../types/user';
import type { Request } from 'express';
interface PermissionChecker {
    hasPermission(user: User, permissions: string[], projectId?: string, environment?: string): Promise<boolean>;
}
export declare function findParam(name: string, { params, body }: Request, defaultValue?: string): string | undefined;
declare const rbacMiddleware: (config: Pick<IUnleashConfig, "getLogger" | "isOss">, { featureToggleStore, segmentStore, }: Pick<IUnleashStores, "featureToggleStore" | "segmentStore">, accessService: PermissionChecker) => any;
export default rbacMiddleware;
//# sourceMappingURL=rbac-middleware.d.ts.map