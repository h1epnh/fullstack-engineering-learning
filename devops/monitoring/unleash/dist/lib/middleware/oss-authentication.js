"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authorization_middleware_1 = __importDefault(require("./authorization-middleware"));
function ossAuthHook(app, getLogger, baseUriPath) {
    app.use(`${baseUriPath}/api`, (0, authorization_middleware_1.default)(getLogger, baseUriPath));
    app.use(`${baseUriPath}/logout`, (0, authorization_middleware_1.default)(getLogger, baseUriPath));
}
exports.default = ossAuthHook;
//# sourceMappingURL=oss-authentication.js.map