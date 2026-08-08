import { IAuthType, type IUnleashConfig, type IUnleashOptions } from './types/option';
export declare function authTypeFromString(s?: string, defaultType?: IAuthType): IAuthType;
export declare function resolveIsOss(isEnterprise: boolean, isOssOption?: boolean, uiEnvironment?: string, testEnvironmentActive?: boolean): boolean;
export declare function createConfig(options: IUnleashOptions): IUnleashConfig;
//# sourceMappingURL=create-config.d.ts.map