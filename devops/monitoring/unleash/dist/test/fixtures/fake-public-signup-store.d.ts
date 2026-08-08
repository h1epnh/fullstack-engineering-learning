import type { IPublicSignupTokenStore } from '../../lib/types/stores/public-signup-token-store';
import type { PublicSignupTokenSchema } from '../../lib/openapi/spec/public-signup-token-schema';
import type { IPublicSignupTokenCreate } from '../../lib/types/models/public-signup-token';
export default class FakePublicSignupStore implements IPublicSignupTokenStore {
    tokens: PublicSignupTokenSchema[];
    addTokenUser(secret: string, userId: number): Promise<void>;
    get(secret: string): Promise<PublicSignupTokenSchema>;
    isValid(secret: string): Promise<boolean>;
    count(): Promise<number>;
    delete(secret: string): Promise<void>;
    getAllActive(): Promise<PublicSignupTokenSchema[]>;
    create(newToken: IPublicSignupTokenCreate): Promise<PublicSignupTokenSchema>;
    insert(newToken: IPublicSignupTokenCreate): Promise<PublicSignupTokenSchema>;
    update(secret: string, { expiresAt, enabled }: {
        expiresAt?: Date;
        enabled?: boolean;
    }): Promise<PublicSignupTokenSchema>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists(key: string): Promise<boolean>;
    getAll(query?: Object): Promise<PublicSignupTokenSchema[]>;
}
//# sourceMappingURL=fake-public-signup-store.d.ts.map