import type { URL } from 'url';
import { type IAuditUser, type IUser, type IUserWithRootRole } from '../types/user';
import type { AccessService } from './access-service';
import type ResetTokenService from './reset-token-service';
import type { EmailService } from './email-service';
import type { IAuthOption, IUnleashConfig, UsernameAdminUser } from '../types/option';
import type SessionService from './session-service';
import type { IUnleashStores } from '../types/stores';
import { RoleName } from '../types/model';
import type SettingService from './setting-service';
import type { TokenUserSchema } from '../openapi/spec/token-user-schema';
import type EventService from '../features/events/event-service';
export interface ICreateUser {
    name?: string;
    email?: string;
    username?: string;
    password?: string;
    rootRole: number | RoleName;
}
export interface IUpdateUser {
    id: number;
    name?: string;
    email?: string;
    rootRole?: number | RoleName;
}
export interface ILoginUserRequest {
    email: string;
    name?: string;
    rootRole?: number | RoleName;
    autoCreate?: boolean;
}
declare class UserService {
    private logger;
    private store;
    private eventService;
    private eventBus;
    private accessService;
    private resetTokenService;
    private sessionService;
    private emailService;
    private settingService;
    private flagResolver;
    private passwordResetTimeouts;
    private baseUriPath;
    readonly unleashUrl: string;
    readonly maxParallelSessions: number;
    constructor(stores: Pick<IUnleashStores, 'userStore'>, { server, getLogger, authentication, eventBus, flagResolver, session, }: Pick<IUnleashConfig, 'getLogger' | 'authentication' | 'server' | 'eventBus' | 'flagResolver' | 'session'>, services: {
        accessService: AccessService;
        resetTokenService: ResetTokenService;
        emailService: EmailService;
        eventService: EventService;
        sessionService: SessionService;
        settingService: SettingService;
    });
    validatePassword(password: string): boolean;
    initAdminUser({ createAdminUser, initialAdminUser, }: Pick<IAuthOption, 'createAdminUser' | 'initialAdminUser'>): Promise<void>;
    initAdminUsernameUser(usernameAdminUser?: UsernameAdminUser): Promise<void>;
    getAll(): Promise<IUserWithRootRole[]>;
    getUser(id: number): Promise<IUserWithRootRole>;
    search(query: string): Promise<IUser[]>;
    getByEmail(email: string): Promise<IUser>;
    private validateEmail;
    createUser({ username, email, name, password, rootRole }: ICreateUser, auditUser?: IAuditUser): Promise<IUserWithRootRole>;
    newUserInviteLink(user: IUserWithRootRole, auditUser?: IAuditUser): Promise<string>;
    sendWelcomeEmail(user: IUserWithRootRole, inviteLink: string): Promise<boolean>;
    updateUser({ id, name, email, rootRole }: IUpdateUser, auditUser: IAuditUser): Promise<IUserWithRootRole>;
    deleteUser(userId: number, auditUser: IAuditUser): Promise<void>;
    deleteScimUsers(auditUser: IAuditUser): Promise<void>;
    loginUser(usernameOrEmail: string, password: string, device?: {
        userAgent?: string;
        ip: string;
    }): Promise<IUser>;
    /**
     * Used to login users without specifying password. Used when integrating
     * with external identity providers.
     *
     * @param usernameOrEmail
     * @param autoCreateUser
     * @returns
     */
    loginUserWithoutPassword(email: string, autoCreateUser?: boolean): Promise<IUser>;
    loginUserSSO({ email, name, rootRole, autoCreate, }: ILoginUserRequest): Promise<IUser>;
    loginDemoAuthDefaultAdmin(): Promise<IUser>;
    changePassword(userId: number, password: string): Promise<void>;
    changePasswordWithPreviouslyUsedPasswordCheck(userId: number, password: string): Promise<void>;
    changePasswordWithVerification(userId: number, newPassword: string, oldPassword: string): Promise<void>;
    getUserForToken(token: string): Promise<TokenUserSchema>;
    /**
     * If the password is a strong password will update password and delete all sessions for the user we're changing the password for
     * @param token - the token authenticating this request
     * @param password - new password
     */
    resetPassword(token: string, password: string): Promise<void>;
    createResetPasswordEmail(receiverEmail: string, user?: IUser): Promise<URL>;
}
export default UserService;
//# sourceMappingURL=user-service.d.ts.map