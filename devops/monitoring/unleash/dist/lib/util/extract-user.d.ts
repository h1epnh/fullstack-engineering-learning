import type { IApiRequest, IApiUser, IAuditUser, IAuthRequest, IUser } from '../server-impl';
export declare function extractUsernameFromUser(user: IUser | IApiUser): string;
export declare function extractUsername(req: IAuthRequest | IApiRequest): string;
export declare const extractUserIdFromUser: (user: IUser | IApiUser) => number;
export declare const extractUserId: (req: IAuthRequest | IApiRequest) => number;
export declare const extractUserInfo: (req: IAuthRequest | IApiRequest) => {
    id: number;
    username: string;
};
export declare const extractAuditInfoFromUser: (user: IUser | IApiUser, ip?: string) => IAuditUser;
export declare const extractAuditInfo: (req: IAuthRequest | IApiRequest) => IAuditUser;
//# sourceMappingURL=extract-user.d.ts.map