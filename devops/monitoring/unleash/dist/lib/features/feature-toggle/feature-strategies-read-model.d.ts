import type { Db } from '../../db/db';
import type { IFeatureStrategiesReadModel } from './types/feature-strategies-read-model-type';
export declare class FeatureStrategiesReadModel implements IFeatureStrategiesReadModel {
    private db;
    constructor(db: Db);
    private activeStrategies;
    getMaxFeatureEnvironmentStrategies(): Promise<{
        feature: string;
        environment: string;
        count: number;
    } | null>;
    getMaxFeatureStrategies(): Promise<{
        feature: string;
        count: number;
    } | null>;
    getMaxConstraintValues(): Promise<{
        feature: string;
        environment: string;
        count: number;
    } | null>;
    getMaxConstraintsPerStrategy(): Promise<{
        feature: string;
        environment: string;
        count: number;
    } | null>;
}
//# sourceMappingURL=feature-strategies-read-model.d.ts.map