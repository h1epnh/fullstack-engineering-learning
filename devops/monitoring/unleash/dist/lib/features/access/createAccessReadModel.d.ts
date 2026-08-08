import type { Db, IUnleashConfig } from '../../server-impl';
import type { IAccessReadModel } from './access-read-model-type';
import type { IAccessStore } from '../../types';
export declare const createAccessReadModel: (db: Db, config: IUnleashConfig) => IAccessReadModel;
export declare const createFakeAccessReadModel: (accessStore?: IAccessStore) => IAccessReadModel;
//# sourceMappingURL=createAccessReadModel.d.ts.map