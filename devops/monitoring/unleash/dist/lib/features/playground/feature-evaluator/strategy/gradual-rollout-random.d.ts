import { Strategy } from './strategy';
import type { Context } from '../context';
export default class GradualRolloutRandomStrategy extends Strategy {
    private randomGenerator;
    constructor(randomGenerator?: Function);
    isEnabled(parameters: {
        percentage: number | string;
    }, context: Context): boolean;
}
//# sourceMappingURL=gradual-rollout-random.d.ts.map