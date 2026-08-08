import type { IUnleashConfig, IUnleashServices } from '../types';
import Controller from './controller';
import type { Db } from '../db/db';
declare class IndexRouter extends Controller {
    constructor(config: IUnleashConfig, services: IUnleashServices, db: Db);
}
export default IndexRouter;
//# sourceMappingURL=index.d.ts.map