import { Strategy } from './strategy';
import type { Context } from '../context';
export default class GradualRolloutSessionIdStrategy extends Strategy {
    constructor();
    isEnabled(parameters: {
        percentage: number | string;
        groupId?: string;
    }, context: Context): boolean;
}
//# sourceMappingURL=gradual-rollout-session-id.d.ts.map