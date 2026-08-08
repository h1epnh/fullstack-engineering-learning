import { Strategy } from './strategy';
import type { Context } from '../context';
export default class GradualRolloutUserIdStrategy extends Strategy {
    constructor();
    isEnabled(parameters: {
        percentage: number | string;
        groupId?: string;
    }, context: Context): boolean;
}
//# sourceMappingURL=gradual-rollout-user-id.d.ts.map