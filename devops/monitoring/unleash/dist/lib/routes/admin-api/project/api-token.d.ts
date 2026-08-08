import { type ApiTokenSchema, type ApiTokensSchema } from '../../../openapi';
import { type IUnleashConfig, type IUnleashServices } from '../../../types';
import type { IAuthRequest } from '../../unleash-types';
import Controller from '../../controller';
import type { Response } from 'express';
interface ProjectTokenParam {
    token: string;
    projectId: string;
}
export declare class ProjectApiTokenController extends Controller {
    private apiTokenService;
    private accessService;
    private frontendApiService;
    private openApiService;
    private projectService;
    private logger;
    constructor(config: IUnleashConfig, { apiTokenService, accessService, frontendApiService, openApiService, projectService, }: Pick<IUnleashServices, 'apiTokenService' | 'accessService' | 'frontendApiService' | 'openApiService' | 'projectService'>);
    getProjectApiTokens(req: IAuthRequest, res: Response<ApiTokensSchema>): Promise<void>;
    createProjectApiToken(req: IAuthRequest, res: Response<ApiTokenSchema>): Promise<any>;
    deleteProjectApiToken(req: IAuthRequest<ProjectTokenParam>, res: Response): Promise<void>;
    private tokenEquals;
    private accessibleTokens;
}
export {};
//# sourceMappingURL=api-token.d.ts.map