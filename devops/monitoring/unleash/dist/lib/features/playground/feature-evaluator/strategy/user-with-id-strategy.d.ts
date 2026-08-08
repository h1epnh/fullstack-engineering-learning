import { Strategy } from './strategy';
import type { Context } from '../context';
export default class UserWithIdStrategy extends Strategy {
    constructor();
    isEnabled(parameters: {
        userIds?: string;
    }, context: Context): boolean;
}
//# sourceMappingURL=user-with-id-strategy.d.ts.map