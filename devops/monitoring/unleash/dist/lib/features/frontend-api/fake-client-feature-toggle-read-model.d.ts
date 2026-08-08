import type { IFeatureToggleClient } from '../../types';
import type { IClientFeatureToggleReadModel } from './client-feature-toggle-read-model-type';
export default class FakeClientFeatureToggleReadModel implements IClientFeatureToggleReadModel {
    private value;
    constructor(value?: Record<string, Record<string, IFeatureToggleClient>>);
    getAll(): Promise<Record<string, Record<string, IFeatureToggleClient>>>;
    setValue(value: Record<string, Record<string, IFeatureToggleClient>>): void;
}
//# sourceMappingURL=fake-client-feature-toggle-read-model.d.ts.map