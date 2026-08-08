import type { Request, Response } from 'express';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
import Controller from '../controller';
import type { IAuthRequest } from '../unleash-types';
import { type TagsSchema } from '../../openapi/spec/tags-schema';
import type { TagSchema } from '../../openapi/spec/tag-schema';
import { type TagWithVersionSchema } from '../../openapi/spec/tag-with-version-schema';
import type { CreateTagSchema } from '../../openapi';
declare class TagController extends Controller {
    private logger;
    private tagService;
    private featureTagService;
    private openApiService;
    private flagResolver;
    constructor(config: IUnleashConfig, { tagService, openApiService, featureTagService, }: Pick<IUnleashServices, 'tagService' | 'openApiService' | 'featureTagService'>);
    getTags(req: Request, res: Response<TagsSchema>): Promise<void>;
    getTagsByType(req: Request, res: Response<TagsSchema>): Promise<void>;
    getTag(req: Request<TagSchema>, res: Response<TagWithVersionSchema>): Promise<void>;
    createTag(req: IAuthRequest<unknown, unknown, CreateTagSchema>, res: Response<TagWithVersionSchema>): Promise<void>;
    deleteTag(req: IAuthRequest<TagSchema>, res: Response): Promise<void>;
}
export default TagController;
//# sourceMappingURL=tag.d.ts.map