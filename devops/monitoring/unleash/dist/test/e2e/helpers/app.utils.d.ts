import type { CreateFeatureStrategySchema } from '../../../lib/openapi';
import type { IUnleashTest } from './test-helper';
export declare const FEATURES_BASE_PATH = "/api/admin/projects/default/features";
export declare const ADMIN_BASE_PATH = "/api/admin";
export declare const createFeatureFlag: (app: IUnleashTest, postData: object, expectStatusCode?: number) => Promise<unknown>;
export declare const addStrategyToFeatureEnv: (app: IUnleashTest, postData: CreateFeatureStrategySchema, envName: string, featureName: string, expectStatusCode?: number) => Promise<any>;
//# sourceMappingURL=app.utils.d.ts.map