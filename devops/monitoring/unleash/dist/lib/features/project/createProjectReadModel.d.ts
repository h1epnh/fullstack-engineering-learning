import type EventEmitter from 'events';
import type { Db } from '../../server-impl';
import type { IProjectReadModel } from './project-read-model-type';
import type { IFlagResolver } from '../../types';
export declare const createProjectReadModel: (db: Db, eventBus: EventEmitter, flagResolver: IFlagResolver) => IProjectReadModel;
export declare const createFakeProjectReadModel: () => IProjectReadModel;
//# sourceMappingURL=createProjectReadModel.d.ts.map