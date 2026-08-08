import type { IStrategyConfig } from '../types';
type SortableStrategy = Pick<IStrategyConfig, 'milestoneId' | 'sortOrder'>;
export declare const sortStrategies: (strategy1: SortableStrategy, strategy2: SortableStrategy) => number;
export {};
//# sourceMappingURL=sortStrategies.d.ts.map