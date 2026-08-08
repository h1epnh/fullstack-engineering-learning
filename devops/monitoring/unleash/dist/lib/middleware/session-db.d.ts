import type { Knex } from 'knex';
import type { RequestHandler } from 'express';
import type { IUnleashConfig } from '../types/option';
declare function sessionDb(config: Pick<IUnleashConfig, 'session' | 'server' | 'secureHeaders'>, knex: Knex): RequestHandler;
export default sessionDb;
//# sourceMappingURL=session-db.d.ts.map