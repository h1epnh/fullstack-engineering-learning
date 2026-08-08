import type { Response } from 'express';
import type { IUnleashConfig } from '../../../types/option';
import { type IProjectParam, type IUnleashServices } from '../../../types';
import type { IAuthRequest } from '../../unleash-types';
import { type BatchFeaturesSchema } from '../../../openapi';
import Controller from '../../controller';
import type { TransactionCreator, UnleashTransaction } from '../../../db/transaction';
export default class ProjectArchiveController extends Controller {
    private readonly logger;
    private featureService;
    private transactionalFeatureToggleService;
    private readonly startTransaction;
    private openApiService;
    private flagResolver;
    constructor(config: IUnleashConfig, { transactionalFeatureToggleService, featureToggleService, openApiService, }: Pick<IUnleashServices, 'transactionalFeatureToggleService' | 'featureToggleService' | 'openApiService'>, startTransaction: TransactionCreator<UnleashTransaction>);
    deleteFeatures(req: IAuthRequest<IProjectParam, any, BatchFeaturesSchema>, res: Response<void>): Promise<void>;
    reviveFeatures(req: IAuthRequest<IProjectParam, any, BatchFeaturesSchema>, res: Response<void>): Promise<void>;
    archiveFeatures(req: IAuthRequest<IProjectParam, void, BatchFeaturesSchema>, res: Response): Promise<void>;
    validateArchiveFeatures(req: IAuthRequest<IProjectParam, void, BatchFeaturesSchema>, res: Response): Promise<void>;
}
//# sourceMappingURL=project-archive.d.ts.map