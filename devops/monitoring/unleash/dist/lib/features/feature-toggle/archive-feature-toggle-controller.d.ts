import type { Request, Response } from 'express';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types';
import Controller from '../../routes/controller';
import type { IAuthRequest } from '../../routes/unleash-types';
import type { TransactionCreator, UnleashTransaction } from '../../db/transaction';
import { type ArchivedFeaturesSchema } from '../../openapi';
export default class ArchiveController extends Controller {
    private featureService;
    private transactionalFeatureToggleService;
    private readonly startTransaction;
    private openApiService;
    constructor(config: IUnleashConfig, { transactionalFeatureToggleService, featureToggleService, openApiService, }: Pick<IUnleashServices, 'transactionalFeatureToggleService' | 'featureToggleService' | 'openApiService'>, startTransaction: TransactionCreator<UnleashTransaction>);
    getArchivedFeatures(req: IAuthRequest, res: Response<ArchivedFeaturesSchema>): Promise<void>;
    getArchivedFeaturesByProjectId(req: Request<{
        projectId: string;
    }, any, any, any>, res: Response<ArchivedFeaturesSchema>): Promise<void>;
    deleteFeature(req: IAuthRequest<{
        featureName: string;
    }>, res: Response<void>): Promise<void>;
    reviveFeature(req: IAuthRequest<{
        featureName: string;
    }>, res: Response<void>): Promise<void>;
}
//# sourceMappingURL=archive-feature-toggle-controller.d.ts.map