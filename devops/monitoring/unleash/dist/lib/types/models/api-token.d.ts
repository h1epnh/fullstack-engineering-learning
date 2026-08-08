import type { IEnvironment } from '../model';
export declare const ALL = "*";
export declare enum ApiTokenType {
    CLIENT = "client",
    ADMIN = "admin",
    FRONTEND = "frontend"
}
export interface ILegacyApiTokenCreate {
    secret: string;
    /**
     * @deprecated Use tokenName instead
     */
    username?: string;
    type: ApiTokenType;
    environment?: string;
    project?: string;
    projects?: string[];
    expiresAt?: Date;
    tokenName?: string;
}
export interface IApiTokenCreate {
    secret: string;
    tokenName: string;
    alias?: string;
    type: ApiTokenType;
    environment: string;
    projects: string[];
    expiresAt?: Date;
    /**
     * @deprecated Use tokenName instead
     */
    username?: string;
}
export interface IApiToken extends Omit<IApiTokenCreate, 'alias'> {
    createdAt: Date;
    seenAt?: Date;
    environment: string;
    project: string;
    alias?: string | null;
}
export declare const isAllProjects: (projects: string[]) => boolean;
export declare const mapLegacyProjects: (project?: string, projects?: string[]) => string[];
export declare const mapLegacyToken: (token: Omit<ILegacyApiTokenCreate, "secret">) => Omit<IApiTokenCreate, "secret">;
export declare const mapLegacyTokenWithSecret: (token: ILegacyApiTokenCreate) => IApiTokenCreate;
export declare const validateApiToken: ({ type, projects, environment, }: Omit<IApiTokenCreate, "secret">) => void;
export declare const validateApiTokenEnvironment: ({ environment }: Pick<IApiTokenCreate, "environment">, environments: IEnvironment[]) => void;
//# sourceMappingURL=api-token.d.ts.map