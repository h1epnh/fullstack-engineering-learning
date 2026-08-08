"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strategy_1 = require("./strategy");
const ip_address_1 = require("ip-address");
class RemoteAddressStrategy extends strategy_1.Strategy {
    constructor() {
        super('remoteAddress');
    }
    isEnabled(parameters, context) {
        if (!parameters.IPs) {
            return false;
        }
        return parameters.IPs.split(/\s*,\s*/).some((range) => {
            if (range === context.remoteAddress) {
                return true;
            }
            if (ip_address_1.Address4.isValid(range)) {
                try {
                    const subnetRange = new ip_address_1.Address4(range);
                    const remoteAddress = new ip_address_1.Address4(context.remoteAddress || '');
                    return remoteAddress.isInSubnet(subnetRange);
                }
                catch (err) {
                    return false;
                }
            }
            return false;
        });
    }
}
exports.default = RemoteAddressStrategy;
//# sourceMappingURL=remote-address-strategy.js.map