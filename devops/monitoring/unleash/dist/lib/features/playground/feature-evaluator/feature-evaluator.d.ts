import { type FeatureStrategiesEvaluationResult } from './client';
import { type RepositoryInterface } from './repository';
import type { Context } from './context';
import { Strategy } from './strategy';
import type { ClientFeaturesResponse, FeatureInterface } from './feature';
import type { Variant } from './variant';
import { type FallbackFunction } from './helpers';
import { type BootstrapOptions } from './repository/bootstrap-provider';
import type { StorageProvider } from './repository/storage-provider';
export { Strategy };
export interface FeatureEvaluatorConfig {
    appName: string;
    environment?: string;
    strategies?: Strategy[];
    repository?: RepositoryInterface;
    bootstrap?: BootstrapOptions;
    storageProvider?: StorageProvider<ClientFeaturesResponse>;
}
export interface StaticContext {
    appName: string;
    environment: string;
}
export declare class FeatureEvaluator {
    private repository;
    private client;
    private staticContext;
    constructor({ appName, environment, strategies, repository, bootstrap, storageProvider, }: FeatureEvaluatorConfig);
    start(): Promise<void>;
    destroy(): void;
    isEnabled(name: string, context?: Context, fallbackFunction?: FallbackFunction): FeatureStrategiesEvaluationResult;
    isEnabled(name: string, context?: Context, fallbackValue?: boolean): FeatureStrategiesEvaluationResult;
    getVariant(name: string, context?: Context, fallbackVariant?: Variant): Variant;
    forceGetVariant(name: string, forcedResults: Pick<FeatureStrategiesEvaluationResult, 'result' | 'variant'>, context?: Context, fallbackVariant?: Variant): Variant;
    getFeatureToggleDefinition(toggleName: string): FeatureInterface;
    getFeatureToggleDefinitions(): FeatureInterface[];
}
//# sourceMappingURL=feature-evaluator.d.ts.map