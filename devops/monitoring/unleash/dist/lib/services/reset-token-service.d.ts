import { URL } from 'url';
import type { IUnleashConfig } from '../types/option';
import type { IUnleashStores } from '../types/stores';
import type { IResetQuery, IResetToken } from '../types/stores/reset-token-store';
interface IInviteLinks {
    [key: string]: string;
}
export default class ResetTokenService {
    private store;
    private logger;
    private readonly unleashBase;
    constructor({ resetTokenStore }: Pick<IUnleashStores, 'resetTokenStore'>, { getLogger, server }: Pick<IUnleashConfig, 'getLogger' | 'server'>);
    useAccessToken(token: IResetQuery): Promise<boolean>;
    getActiveInvitations(): Promise<IInviteLinks>;
    expireExistingTokensForUser: (userId: number) => Promise<void>;
    isValid(token: string): Promise<IResetToken>;
    private getExistingInvitationUrl;
    private createResetUrl;
    createResetPasswordUrl(forUser: number, creator: string): Promise<URL>;
    createNewUserUrl(forUser: number, creator: string): Promise<URL>;
    createToken(tokenUser: number, creator: string, expiryDelta?: number): Promise<IResetToken>;
    private generateToken;
}
export {};
//# sourceMappingURL=reset-token-service.d.ts.map