import type { Db } from '../../../db/db';
import type { ILastSeenReadModel } from './types/last-seen-read-model-type';
export interface IFeatureLastSeenResults {
    [featureName: string]: {
        [environment: string]: {
            lastSeen: string;
        };
    };
}
export declare class LastSeenAtReadModel implements ILastSeenReadModel {
    private db;
    constructor(db: Db);
    getForFeature(features: string[]): Promise<IFeatureLastSeenResults>;
}
//# sourceMappingURL=last-seen-read-model.d.ts.map