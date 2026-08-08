import { Strategy } from './strategy';
import type { Context } from '../context';
export default class FlexibleRolloutStrategy extends Strategy {
    private randomGenerator;
    constructor(radnomGenerator?: Function);
    resolveStickiness(stickiness: string, context: Context): any;
    isEnabled(parameters: {
        groupId?: string;
        rollout: number | string;
        stickiness?: string;
    }, context: Context): boolean;
}
//# sourceMappingURL=flexible-rollout-strategy.d.ts.map