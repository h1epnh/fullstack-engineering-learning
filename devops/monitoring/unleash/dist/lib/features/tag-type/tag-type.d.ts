import type { Request, Response } from 'express';
import Controller from '../../routes/controller';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
import type { IAuthRequest } from '../../routes/unleash-types';
import type { TagTypesSchema } from '../../openapi/spec/tag-types-schema';
import { type ValidateTagTypeSchema } from '../../openapi/spec/validate-tag-type-schema';
import type { TagTypeSchema } from '../../openapi/spec/tag-type-schema';
import type { UpdateTagTypeSchema } from '../../openapi/spec/update-tag-type-schema';
declare class TagTypeController extends Controller {
    private logger;
    private tagTypeService;
    private openApiService;
    constructor(config: IUnleashConfig, { transactionalTagTypeService, openApiService, }: Pick<IUnleashServices, 'transactionalTagTypeService' | 'openApiService'>);
    getTagTypes(req: Request, res: Response<TagTypesSchema>): Promise<void>;
    validateTagType(req: Request<unknown, unknown, TagTypeSchema>, res: Response<ValidateTagTypeSchema>): Promise<void>;
    createTagType(req: IAuthRequest<unknown, unknown, TagTypeSchema>, res: Response): Promise<void>;
    updateTagType(req: IAuthRequest<{
        name: string;
    }, unknown, UpdateTagTypeSchema>, res: Response): Promise<void>;
    getTagType(req: Request, res: Response): Promise<void>;
    deleteTagType(req: IAuthRequest, res: Response): Promise<void>;
}
export default TagTypeController;
//# sourceMappingURL=tag-type.d.ts.map