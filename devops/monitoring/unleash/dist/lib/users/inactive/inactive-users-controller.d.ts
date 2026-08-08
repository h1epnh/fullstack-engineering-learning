import Controller from '../../routes/controller';
import { type IUnleashConfig, type IUnleashServices } from '../../types';
import { type IdsSchema, type InactiveUserSchema, type InactiveUsersSchema } from '../../openapi';
import type { IAuthRequest } from '../../routes/unleash-types';
import type { Response } from 'express';
export declare class InactiveUsersController extends Controller {
    private readonly logger;
    private inactiveUsersService;
    private openApiService;
    private flagResolver;
    private readonly userInactivityThresholdInDays;
    constructor(config: IUnleashConfig, { inactiveUsersService, openApiService, }: Pick<IUnleashServices, 'inactiveUsersService' | 'openApiService'>);
    getInactiveUsers(_req: IAuthRequest, res: Response<InactiveUsersSchema>): Promise<void>;
    anonymiseUsers(users: InactiveUserSchema[]): InactiveUserSchema[];
    deleteInactiveUsers(req: IAuthRequest<undefined, undefined, IdsSchema>, res: Response<void>): Promise<void>;
}
//# sourceMappingURL=inactive-users-controller.d.ts.map