import type { IFeatureStrategiesReadModel } from './types/feature-strategies-read-model-type';
export declare class FakeFeatureStrategiesReadModel implements IFeatureStrategiesReadModel {
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
//# sourceMappingURL=fake-feature-strategies-read-model.d.ts.map