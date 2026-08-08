"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariantValue = void 0;
const unleash_client_1 = require("unleash-client");
const variant_1 = require("unleash-client/lib/variant");
class FlagResolver {
    constructor(expOpt) {
        this.experiments = expOpt.flags;
        this.externalResolver = expOpt.externalResolver;
    }
    getAll(context) {
        const flags = { ...this.experiments };
        Object.keys(flags).forEach((flagName) => {
            const flag = flags[flagName];
            if (typeof flag === 'boolean') {
                if (!flag) {
                    flags[flagName] = this.externalResolver.isEnabled(flagName, context);
                }
            }
            else {
                if (!flag?.enabled) {
                    flags[flagName] = this.externalResolver.getVariant(flagName, context);
                }
            }
        });
        return flags;
    }
    isEnabled(expName, context) {
        const exp = this.experiments[expName];
        if (exp) {
            if (typeof exp === 'boolean')
                return exp;
            else
                return exp.enabled;
        }
        return this.externalResolver.isEnabled(expName, context);
    }
    getVariant(expName, context) {
        const exp = this.experiments[expName];
        if (exp) {
            if (typeof exp === 'boolean')
                return (0, variant_1.getDefaultVariant)();
            else if (exp.enabled)
                return exp;
        }
        return this.externalResolver.getVariant(expName, context);
    }
}
exports.default = FlagResolver;
const getVariantValue = (variant) => {
    if (variant?.enabled) {
        if (!variant.payload)
            return variant.name;
        if (variant.payload.type === unleash_client_1.PayloadType.JSON) {
            return JSON.parse(variant.payload.value);
        }
        return variant.payload.value;
    }
};
exports.getVariantValue = getVariantValue;
//# sourceMappingURL=flag-resolver.js.map