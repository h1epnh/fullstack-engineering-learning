import type { Collaborator, IFeatureCollaboratorsReadModel } from './types/feature-collaborators-read-model-type';
export declare class FakeFeatureCollaboratorsReadModel implements IFeatureCollaboratorsReadModel {
    getFeatureCollaborators(feature: string): Promise<Array<Collaborator>>;
}
//# sourceMappingURL=fake-feature-collaborators-read-model.d.ts.map