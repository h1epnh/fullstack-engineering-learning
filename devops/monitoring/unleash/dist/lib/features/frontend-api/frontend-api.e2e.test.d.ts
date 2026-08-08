import { ApiTokenType, type IApiToken, type IApiTokenCreate } from '../../types/models/api-token';
export declare const createApiToken: (type: ApiTokenType, overrides?: Partial<Omit<IApiTokenCreate, "type" | "secret">>) => Promise<IApiToken>;
//# sourceMappingURL=frontend-api.e2e.test.d.ts.map