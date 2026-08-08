export type Collaborator = {
    id: number;
    name: string;
    imageUrl: string;
};
export interface IFeatureCollaboratorsReadModel {
    getFeatureCollaborators(feature: string): Promise<Array<Collaborator>>;
}
//# sourceMappingURL=feature-collaborators-read-model-type.d.ts.map