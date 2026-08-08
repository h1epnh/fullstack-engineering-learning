import type { IUniqueConnectionReadModel, IUniqueConnectionStore } from '../../types';
export declare class UniqueConnectionReadModel implements IUniqueConnectionReadModel {
    private uniqueConnectionStore;
    constructor(uniqueConnectionStore: IUniqueConnectionStore);
    getStats(): Promise<{
        previous: any;
        current: any;
        previousFrontend: any;
        currentFrontend: any;
        previousBackend: any;
        currentBackend: any;
    }>;
}
//# sourceMappingURL=unique-connection-read-model.d.ts.map