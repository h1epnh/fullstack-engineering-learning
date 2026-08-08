import supertest from 'supertest';
import { type IUnleashConfig } from '../../../lib/types/option';
import { type IUnleashStores } from '../../../lib/types';
import type { IUnleashServices } from '../../../lib/types/services';
import type { Db } from '../../../lib/db/db';
import type { IContextFieldDto } from '../../../lib/features/context/context-field-store-type';
import type { CreateDependentFeatureSchema, CreateFeatureSchema, CreateFeatureStrategySchema, ImportTogglesSchema } from '../../../lib/openapi';
import type { Knex } from 'knex';
import type TestAgent from 'supertest/lib/agent';
import type Test from 'supertest/lib/test';
import type { Server } from 'node:http';
export interface IUnleashTest extends IUnleashHttpAPI {
    request: TestAgent<Test>;
    destroy: () => Promise<void>;
    services: IUnleashServices;
    config: IUnleashConfig;
}
export interface IUnleashNoSupertest {
    server: Server;
    services: IUnleashServices;
    config: IUnleashConfig;
    destroy: () => Promise<void>;
}
/**
 * This is a collection of API helpers. The response code is optional, and should default to the success code for the request.
 *
 * All functions return a supertest.Test object, which can be used to compose more assertions on the response.
 */
export interface IUnleashHttpAPI {
    addStrategyToFeatureEnv(postData: CreateFeatureStrategySchema, envName: string, featureName: string, project?: string, expectStatusCode?: number): supertest.Test;
    createFeature(feature: string | CreateFeatureSchema, project?: string, expectedResponseCode?: number): supertest.Test;
    enableFeature(feature: string, environment: string, project?: string, expectedResponseCode?: number): supertest.Test;
    favoriteFeature(feature: string, project?: string, expectedResponseCode?: number): supertest.Test;
    getFeatures(name?: string, expectedResponseCode?: number): supertest.Test;
    getProjectFeatures(project: string, name?: string, expectedResponseCode?: number): supertest.Test;
    archiveFeature(name: string, project?: string, expectedResponseCode?: number): supertest.Test;
    createContextField(contextField: IContextFieldDto, expectedResponseCode?: number): supertest.Test;
    linkProjectToEnvironment(project: string, environment: string, expectedResponseCode?: number): supertest.Test;
    importToggles(importPayload: ImportTogglesSchema, expectedResponseCode?: number): supertest.Test;
    addDependency(child: string, parent: string | CreateDependentFeatureSchema): supertest.Test;
    addTag(feature: string, tag: {
        type: string;
        value: string;
    }, expectedResponseCode?: number): supertest.Test;
    getRecordedEvents(): supertest.Test;
    createSegment(postData: object, expectStatusCode?: number): supertest.Test;
    deleteSegment(segmentId: number, expectedResponseCode?: number): supertest.Test;
    updateSegment(segmentId: number, postData: object, expectStatusCode?: number): supertest.Test;
}
export declare function setupApp(stores: IUnleashStores): Promise<IUnleashTest>;
export declare function setupAppWithoutSupertest(stores: any, customOptions?: any, db?: Db): Promise<IUnleashNoSupertest>;
export declare function setupAppWithCustomConfig(stores: IUnleashStores, customOptions: any, db?: Db): Promise<IUnleashTest>;
export declare function setupAppWithAuth(stores: IUnleashStores, customOptions?: any, db?: Db): Promise<IUnleashTest>;
export declare function setupAppWithCustomAuth(stores: IUnleashStores, preHook?: Function, customOptions?: any, db?: Db): Promise<IUnleashTest>;
export declare function setupAppWithBaseUrl(stores: IUnleashStores, baseUriPath?: string): Promise<IUnleashTest>;
export declare const insertLastSeenAt: (featureName: string, db: Knex, environment?: string, date?: string) => Promise<string>;
export declare const insertFeatureEnvironmentsLastSeen: (featureName: string, db: Knex, environment?: string, date?: string) => Promise<string>;
//# sourceMappingURL=test-helper.d.ts.map