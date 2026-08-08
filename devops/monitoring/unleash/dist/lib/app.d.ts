import { type Application, type RequestHandler } from 'express';
import type { IUnleashServices } from './types/services';
import { type IUnleashConfig } from './types/option';
import type { IUnleashStores } from './types';
import type { Knex } from 'knex';
export default function getApp(config: IUnleashConfig, stores: IUnleashStores, services: IUnleashServices, unleashSession?: RequestHandler, db?: Knex): Promise<Application>;
//# sourceMappingURL=app.d.ts.map