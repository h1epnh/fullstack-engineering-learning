"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const unleash_client_1 = require("unleash-client");
const experimental_1 = require("../types/experimental");
const flag_resolver_1 = __importStar(require("./flag-resolver"));
const variant_1 = require("unleash-client/lib/variant");
test('should produce empty exposed flags', () => {
    const resolver = new flag_resolver_1.default(experimental_1.defaultExperimentalOptions);
    const result = resolver.getAll();
    expect(result.anonymiseEventLog).toBe(false);
});
test('should produce UI flags with extra dynamic flags', () => {
    const config = {
        ...experimental_1.defaultExperimentalOptions,
        flags: { extraFlag: false },
    };
    const resolver = new flag_resolver_1.default(config);
    const result = resolver.getAll();
    expect(result.extraFlag).toBe(false);
});
test('should use external resolver for dynamic flags', () => {
    const externalResolver = {
        isEnabled: (name) => {
            if (name === 'extraFlag') {
                return true;
            }
        },
        getVariant: () => (0, variant_1.getDefaultVariant)(),
    };
    const config = {
        flags: { extraFlag: false },
        externalResolver,
    };
    const resolver = new flag_resolver_1.default(config);
    const result = resolver.getAll();
    expect(result.extraFlag).toBe(true);
});
test('should not use external resolver for enabled experiments', () => {
    const externalResolver = {
        isEnabled: () => {
            return false;
        },
        getVariant: () => (0, variant_1.getDefaultVariant)(),
    };
    const config = {
        flags: { should_be_enabled: true, extraFlag: false },
        externalResolver,
    };
    const resolver = new flag_resolver_1.default(config);
    const result = resolver.getAll();
    expect(result.should_be_enabled).toBe(true);
});
test('should load experimental flags', () => {
    const externalResolver = {
        isEnabled: () => {
            return false;
        },
        getVariant: () => (0, variant_1.getDefaultVariant)(),
    };
    const config = {
        flags: { extraFlag: false, someFlag: true },
        externalResolver,
    };
    const resolver = new flag_resolver_1.default(config);
    expect(resolver.isEnabled('someFlag')).toBe(true);
    expect(resolver.isEnabled('extraFlag')).toBe(false);
});
test('should load experimental flags from external provider', () => {
    const externalResolver = {
        isEnabled: (name) => {
            if (name === 'extraFlag') {
                return true;
            }
        },
        getVariant: () => (0, variant_1.getDefaultVariant)(),
    };
    const config = {
        flags: { extraFlag: false, someFlag: true },
        externalResolver,
    };
    const resolver = new flag_resolver_1.default(config);
    expect(resolver.isEnabled('someFlag')).toBe(true);
    expect(resolver.isEnabled('extraFlag')).toBe(true);
});
test('should support variant flags', () => {
    const variant = {
        enabled: true,
        name: 'variant',
        payload: {
            type: unleash_client_1.PayloadType.STRING,
            value: 'variant-A',
        },
    };
    const externalResolver = {
        isEnabled: () => true,
        getVariant: (name) => {
            if (name === 'extraFlag') {
                return variant;
            }
            return (0, variant_1.getDefaultVariant)();
        },
    };
    const config = {
        flags: { extraFlag: undefined, someFlag: true, otherflag: false },
        externalResolver,
    };
    const resolver = new flag_resolver_1.default(config);
    expect(resolver.getVariant('someFlag')).toStrictEqual((0, variant_1.getDefaultVariant)());
    expect(resolver.getVariant('otherFlag')).toStrictEqual((0, variant_1.getDefaultVariant)());
    expect(resolver.getVariant('extraFlag')).toStrictEqual(variant);
});
test('should expose an helper to get variant value', () => {
    expect((0, flag_resolver_1.getVariantValue)({
        enabled: true,
        name: 'variant-A',
    })).toBe('variant-A');
    expect((0, flag_resolver_1.getVariantValue)({
        enabled: true,
        name: 'variant',
        payload: {
            type: unleash_client_1.PayloadType.STRING,
            value: 'variant-B',
        },
    })).toBe('variant-B');
    expect((0, flag_resolver_1.getVariantValue)({
        enabled: true,
        name: 'variant',
        payload: {
            type: unleash_client_1.PayloadType.JSON,
            value: `{"foo": "bar"}`,
        },
    })).toStrictEqual({
        foo: 'bar',
    });
});
test('should call external resolver getVariant when not overridden to be true, even if set as object in experimental', () => {
    const variant = {
        enabled: true,
        name: 'variant',
        payload: {
            type: unleash_client_1.PayloadType.STRING,
            value: 'variant-A',
        },
    };
    const externalResolver = {
        isEnabled: () => true,
        getVariant: (name) => {
            if (name === 'variantFlag') {
                return variant;
            }
            return (0, variant_1.getDefaultVariant)();
        },
    };
    const config = {
        flags: {
            variantFlag: {
                name: 'variant-flag',
                enabled: false,
                payload: {
                    type: unleash_client_1.PayloadType.JSON,
                    value: '',
                },
            },
        },
        externalResolver,
    };
    const resolver = new flag_resolver_1.default(config);
    expect(resolver.getVariant('variantFlag')).toStrictEqual(variant);
});
//# sourceMappingURL=flag-resolver.test.js.map