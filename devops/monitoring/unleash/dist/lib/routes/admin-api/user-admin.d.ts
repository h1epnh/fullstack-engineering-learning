import type { Request, Response } from 'express';
import Controller from '../controller';
import type { IUnleashConfig, IUnleashServices } from '../../types';
import type { IAuthRequest } from '../unleash-types';
import type { IUser } from '../../server-impl';
import { type UserSchema } from '../../openapi/spec/user-schema';
import { type UsersSchema } from '../../openapi/spec/users-schema';
import { type UsersSearchSchema } from '../../openapi/spec/users-search-schema';
import type { CreateUserSchema } from '../../openapi/spec/create-user-schema';
import type { UpdateUserSchema } from '../../openapi/spec/update-user-schema';
import type { PasswordSchema } from '../../openapi/spec/password-schema';
import type { IdSchema } from '../../openapi/spec/id-schema';
import { type ResetPasswordSchema } from '../../openapi/spec/reset-password-schema';
import { type UsersGroupsBaseSchema } from '../../openapi/spec/users-groups-base-schema';
import { type AdminCountSchema } from '../../openapi/spec/admin-count-schema';
import { type CreateUserResponseSchema } from '../../openapi/spec/create-user-response-schema';
import { type UserAccessOverviewSchema } from '../../openapi';
export default class UserAdminController extends Controller {
    private flagResolver;
    private userService;
    private accountService;
    private accessService;
    private readonly logger;
    private resetTokenService;
    private settingService;
    private openApiService;
    private groupService;
    readonly isEnterprise: boolean;
    constructor(config: IUnleashConfig, { userService, accountService, accessService, resetTokenService, settingService, openApiService, groupService, }: Pick<IUnleashServices, 'userService' | 'accountService' | 'accessService' | 'emailService' | 'resetTokenService' | 'settingService' | 'openApiService' | 'groupService'>);
    resetUserPassword(req: IAuthRequest<unknown, ResetPasswordSchema, IdSchema>, res: Response<ResetPasswordSchema>): Promise<void>;
    getUsers(req: Request, res: Response<UsersSchema>): Promise<void>;
    anonymiseUsers(users: IUser[]): IUser[];
    searchUsers(req: Request, res: Response<UsersSearchSchema>): Promise<void>;
    getBaseUsersAndGroups(req: Request, res: Response<UsersGroupsBaseSchema>): Promise<void>;
    getUser(req: Request<{
        id: number;
    }>, res: Response<UserSchema>): Promise<void>;
    createUser(req: IAuthRequest<unknown, unknown, CreateUserSchema>, res: Response<CreateUserResponseSchema>): Promise<void>;
    updateUser(req: IAuthRequest<{
        id: number;
    }, CreateUserResponseSchema, UpdateUserSchema>, res: Response<CreateUserResponseSchema>): Promise<void>;
    deleteUser(req: IAuthRequest<{
        id: number;
    }>, res: Response): Promise<void>;
    validateUserPassword(req: IAuthRequest<unknown, unknown, PasswordSchema>, res: Response): Promise<void>;
    changeUserPassword(req: IAuthRequest<{
        id: number;
    }, unknown, PasswordSchema>, res: Response): Promise<void>;
    getAdminCount(req: Request, res: Response<AdminCountSchema>): Promise<void>;
    getPermissions(req: IAuthRequest<{
        id: number;
    }, unknown, unknown, {
        project?: string;
        environment?: string;
    }>, res: Response<UserAccessOverviewSchema>): Promise<void>;
    throwIfScimUser({ id, scimId, }: Pick<IUser, 'id' | 'scimId'>): Promise<void>;
    isScimUser({ id, scimId, }: Pick<IUser, 'id' | 'scimId'>): Promise<boolean>;
    deleteScimUsers(req: IAuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=user-admin.d.ts.map