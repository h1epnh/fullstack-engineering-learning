import type { Db } from '../../db/db';
import type { Collaborator, IFeatureCollaboratorsReadModel } from './types/feature-collaborators-read-model-type';
export declare class FeatureCollaboratorsReadModel implements IFeatureCollaboratorsReadModel {
    private db;
    constructor(db: Db);
    getFeatureCollaborators(feature: string): Promise<Array<Collaborator>>;
}
//# sourceMappingURL=feature-collaborators-read-model.d.ts.map