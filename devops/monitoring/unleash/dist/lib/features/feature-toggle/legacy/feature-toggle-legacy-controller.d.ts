import type { Request, Response } from 'express';
import Controller from '../../../routes/controller';
import type { IUnleashConfig } from '../../../types/option';
import type { IUnleashServices } from '../../../types';
import type { IFeatureToggleQuery } from '../../../types/model';
import type { IAuthRequest } from '../../../routes/unleash-types';
import type { TagSchema } from '../../../openapi/spec/tag-schema';
import type { TagsSchema } from '../../../openapi/spec/tags-schema';
import type { UpdateTagsSchema } from '../../../openapi/spec/update-tags-schema';
import type { ValidateFeatureSchema } from '../../../openapi/spec/validate-feature-schema';
declare class FeatureController extends Controller {
    private tagService;
    private openApiService;
    private service;
    constructor(config: IUnleashConfig, { featureTagService, featureToggleService, openApiService, }: Pick<IUnleashServices, 'featureTagService' | 'featureToggleService' | 'openApiService'>);
    paramToArray(param: any): any;
    prepQuery({ tag, project, namePrefix, }: any): Promise<IFeatureToggleQuery>;
    listTags(req: Request<{
        featureName: string;
    }, any, any, any>, res: Response<TagsSchema>): Promise<void>;
    addTag(req: IAuthRequest<{
        featureName: string;
    }, Response<TagSchema>, TagSchema, any>, res: Response<TagSchema>): Promise<void>;
    updateTags(req: IAuthRequest<{
        featureName: string;
    }, Response<TagsSchema>, UpdateTagsSchema, any>, res: Response<TagsSchema>): Promise<void>;
    removeTag(req: IAuthRequest<{
        featureName: string;
        type: string;
        value: string;
    }>, res: Response<void>): Promise<void>;
    validate(req: Request<any, any, ValidateFeatureSchema, any>, res: Response<void>): Promise<void>;
}
export default FeatureController;
//# sourceMappingURL=feature-toggle-legacy-controller.d.ts.map