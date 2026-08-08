import type { IStrategyConfig } from '../../../types';
import type { FeatureStrategiesEvaluationResult } from './client';
import type { Context } from './context';
export type FallbackFunction = (name: string, context: Context) => boolean;
export declare function createFallbackFunction(name: string, context: Context, fallback?: FallbackFunction | boolean): () => FeatureStrategiesEvaluationResult;
export declare function resolveContextValue(context: Context, field: string): string | undefined;
export declare function safeName(str?: string): string;
export declare function getDefaultStrategy(featureName: string): IStrategyConfig;
export declare function getProjectDefaultStrategy(defaultStrategy: IStrategyConfig, featureName: string): IStrategyConfig;
//# sourceMappingURL=helpers.d.ts.map