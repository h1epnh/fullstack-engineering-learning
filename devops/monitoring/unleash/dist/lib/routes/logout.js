"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const types_1 = require("../types");
const controller_1 = __importDefault(require("./controller"));
class LogoutController extends controller_1.default {
    constructor(config, { sessionService }) {
        super(config);
        this.sessionService = sessionService;
        this.baseUri = config.server.baseUriPath;
        this.clearSiteDataOnLogout = config.session.clearSiteDataOnLogout;
        this.cookieName = config.session.cookieName;
        this.route({
            method: 'post',
            path: '/',
            handler: this.logout,
            permission: types_1.NONE,
            acceptAnyContentType: true,
        });
    }
    async logout(req, res) {
        if (req.session) {
            // Allow SSO to register custom logout logic.
            if (req.session.logoutUrl) {
                res.redirect(req.session.logoutUrl);
                return;
            }
        }
        if (req.logout) {
            if (this.isReqLogoutWithoutCallback(req.logout)) {
                // passport < 0.6.0
                req.logout();
            }
            else {
                // for passport >= 0.6.0, a callback function is expected as first argument.
                // to reuse controller error handling, function is turned into a promise
                const logoutAsyncFn = (0, util_1.promisify)(req.logout).bind(req);
                await logoutAsyncFn();
            }
        }
        if (req.session) {
            if (req.session.user?.id) {
                await this.sessionService.deleteSessionsForUser(req.session.user.id);
            }
            req.session.destroy();
        }
        res.clearCookie(this.cookieName);
        if (this.clearSiteDataOnLogout) {
            res.set('Clear-Site-Data', '"cookies", "storage"');
        }
        if (req.user?.id) {
            await this.sessionService.deleteSessionsForUser(req.user.id);
        }
        res.redirect(`${this.baseUri}/`);
    }
    isReqLogoutWithoutCallback(logout) {
        return logout.length === 0;
    }
}
exports.default = LogoutController;
//# sourceMappingURL=logout.js.map