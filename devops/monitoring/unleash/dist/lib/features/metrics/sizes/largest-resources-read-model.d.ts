import type { Db } from '../../../db/db';
import type { ILargestResourcesReadModel } from './largest-resources-read-model-type';
export declare class LargestResourcesReadModel implements ILargestResourcesReadModel {
    private db;
    constructor(db: Db);
    getLargestProjectEnvironments(limit: number): Promise<Array<{
        project: string;
        environment: string;
        size: number;
    }>>;
    getLargestFeatureEnvironments(limit: number): Promise<Array<{
        feature: string;
        environment: string;
        size: number;
    }>>;
}
//# sourceMappingURL=largest-resources-read-model.d.ts.map