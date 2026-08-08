import { Strategy } from './strategy';
import type { Context } from '../context';
export default class RemoteAddressStrategy extends Strategy {
    constructor();
    isEnabled(parameters: {
        IPs?: string;
    }, context: Context): boolean;
}
//# sourceMappingURL=remote-address-strategy.d.ts.map