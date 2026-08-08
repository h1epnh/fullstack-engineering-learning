import type { IFeatureToggleClient } from '../../types';
export interface IClientFeatureToggleReadModel {
    getAll(): Promise<Record<string, Record<string, IFeatureToggleClient>>>;
}
//# sourceMappingURL=client-feature-toggle-read-model-type.d.ts.map