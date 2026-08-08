"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultBootstrapProvider = void 0;
exports.resolveBootstrapProvider = resolveBootstrapProvider;
class DefaultBootstrapProvider {
    constructor(options) {
        this.data = options.data;
        this.segments = options.segments;
    }
    async readBootstrap() {
        if (this.data) {
            return {
                version: 2,
                segments: this.segments,
                features: [...this.data],
            };
        }
        return undefined;
    }
}
exports.DefaultBootstrapProvider = DefaultBootstrapProvider;
function resolveBootstrapProvider(options) {
    return new DefaultBootstrapProvider(options);
}
//# sourceMappingURL=bootstrap-provider.js.map