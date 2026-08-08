import { type IUnleashStores } from '../../types';
import type { IAccessReadModel } from './access-read-model-type';
export declare class AccessReadModel implements IAccessReadModel {
    private store;
    constructor({ accessStore }: Pick<IUnleashStores, 'accessStore'>);
    isRootAdmin(userId: number): Promise<boolean>;
}
//# sourceMappingURL=access-read-model.d.ts.map