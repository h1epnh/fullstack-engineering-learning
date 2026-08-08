import type { IUser } from './user';
export default class NoAuthUser implements IUser {
    isAPI: boolean;
    username: string;
    id: number;
    permissions: string[];
    name: string;
    email: string;
    inviteLink?: string | undefined;
    seenAt?: Date | undefined;
    createdAt?: Date | undefined;
    loginAttempts?: number | undefined;
    imageUrl: string;
    accountType?: 'User' | 'Service Account' | undefined;
    constructor(username?: string, id?: number, permissions?: string[]);
}
//# sourceMappingURL=no-auth-user.d.ts.map