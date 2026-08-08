import type { FeatureToggle, IFeatureToggleClient, IFeatureToggleQuery } from '../../../types/model';
import type { IFeatureToggleClientStore } from '../types/client-feature-toggle-store-type';
export default class FakeClientFeatureToggleStore implements IFeatureToggleClientStore {
    featureToggles: FeatureToggle[];
    getFeatures(featureQuery?: IFeatureToggleQuery, archived?: boolean): Promise<IFeatureToggleClient[]>;
    getClient(query?: IFeatureToggleQuery): Promise<IFeatureToggleClient[]>;
    getFrontendApiClient(query?: IFeatureToggleQuery): Promise<IFeatureToggleClient[]>;
    getPlayground(query?: IFeatureToggleQuery): Promise<IFeatureToggleClient[]>;
    createFeature(feature: any): Promise<void>;
}
//# sourceMappingURL=fake-client-feature-toggle-store.d.ts.map