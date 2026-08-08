import type { IFeatureLastSeenResults } from './last-seen-read-model';
import type { ILastSeenReadModel } from './types/last-seen-read-model-type';
export declare class FakeLastSeenReadModel implements ILastSeenReadModel {
    getForFeature(features: string[]): Promise<IFeatureLastSeenResults>;
}
//# sourceMappingURL=fake-last-seen-read-model.d.ts.map