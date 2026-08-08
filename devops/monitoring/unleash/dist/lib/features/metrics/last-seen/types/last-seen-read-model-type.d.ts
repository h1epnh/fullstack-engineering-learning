import type { IFeatureLastSeenResults } from '../last-seen-read-model';
export interface ILastSeenReadModel {
    getForFeature(features: string[]): Promise<IFeatureLastSeenResults>;
}
//# sourceMappingURL=last-seen-read-model-type.d.ts.map