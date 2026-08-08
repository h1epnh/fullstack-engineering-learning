"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAuthType = void 0;
var IAuthType;
(function (IAuthType) {
    IAuthType["OPEN_SOURCE"] = "open-source";
    IAuthType["DEMO"] = "demo";
    /**
     * Self-hosted by the customer. Should eventually be renamed to better reflect this.
     */
    IAuthType["ENTERPRISE"] = "enterprise";
    /**
     * Hosted by Unleash.
     */
    IAuthType["HOSTED"] = "hosted";
    IAuthType["CUSTOM"] = "custom";
    IAuthType["NONE"] = "none";
})(IAuthType || (exports.IAuthType = IAuthType = {}));
//# sourceMappingURL=option.js.map