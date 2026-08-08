export declare const AccountTypes: readonly ["User", "Service Account"];
type AccountType = (typeof AccountTypes)[number];
export interface UserData {
    id: number;
    name?: string;
    username?: string;
    email?: string;
    imageUrl?: string;
    seenAt?: Date;
    loginAttempts?: number;
    createdAt?: Date;
    isService?: boolean;
    scimId?: string;
}
export interface IUser {
    id: number;
    name?: string;
    username?: string;
    email?: string;
    inviteLink?: string;
    seenAt?: Date;
    createdAt?: Date;
    permissions: string[];
    loginAttempts?: number;
    isAPI: boolean;
    imageUrl?: string;
    accountType?: AccountType;
    scimId?: string;
    deletedSessions?: number;
    activeSessions?: number;
}
export type MinimalUser = Pick<IUser, 'id' | 'name' | 'username' | 'email' | 'imageUrl'>;
export interface IProjectUser extends IUser {
    addedAt: Date;
}
export interface IAuditUser {
    id: number;
    username: string;
    ip: string;
}
export default class User implements IUser {
    isAPI: boolean;
    id: number;
    name: string;
    username: string;
    email: string;
    permissions: string[];
    imageUrl: string;
    seenAt?: Date;
    loginAttempts?: number;
    createdAt?: Date;
    accountType?: AccountType;
    scimId?: string;
    constructor({ id, name, email, username, imageUrl, seenAt, loginAttempts, createdAt, isService, scimId, }: UserData);
    generateImageUrl(): string;
}
export interface IUserWithRootRole extends IUser {
    rootRole: number;
}
export {};
//# sourceMappingURL=user.d.ts.map