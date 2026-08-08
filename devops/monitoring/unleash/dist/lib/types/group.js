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
const joi_1 = __importStar(require("joi"));
const core_1 = require("./core");
class Group {
    constructor({ id, name, description, mappingsSSO, rootRole, createdBy, createdAt, scimId, }) {
        if (!id) {
            throw new joi_1.ValidationError('Id is required', [], undefined);
        }
        joi_1.default.assert(name, joi_1.default.string(), 'Name');
        this.id = id;
        this.name = name;
        this.rootRole = rootRole;
        this.description = description || '';
        this.mappingsSSO = mappingsSSO || [];
        this.createdBy = createdBy || core_1.SYSTEM_USER_AUDIT.username;
        this.createdAt = createdAt;
        this.scimId = scimId;
    }
}
exports.default = Group;
//# sourceMappingURL=group.js.map