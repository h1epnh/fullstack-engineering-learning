import type { ApiTokenType } from './models/api-token';
export interface IApiUserData {
    permissions?: string[];
    projects?: string[];
    project?: string;
    environment: string;
    type: ApiTokenType;
    secret: string;
    tokenName: string;
}
export interface IApiUser {
    internalAdminTokenUserId?: number;
    username: string;
    permissions: string[];
    projects: string[];
    environment: string;
    type: ApiTokenType;
    secret: string;
}
export default class ApiUser implements IApiUser {
    readonly isAPI: boolean;
    readonly permissions: string[];
    readonly projects: string[];
    readonly environment: string;
    readonly type: ApiTokenType;
    readonly secret: string;
    readonly username: string;
    constructor({ permissions, projects, project, environment, type, secret, tokenName, }: IApiUserData);
}
//# sourceMappingURL=api-user.d.ts.map