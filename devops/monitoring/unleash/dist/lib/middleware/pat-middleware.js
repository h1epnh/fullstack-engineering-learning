"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../error/notfound-error"));
const patMiddleware = ({ getLogger }, { accountService }) => {
    const logger = getLogger('/middleware/pat-middleware.ts');
    logger.debug('Enabling PAT middleware');
    return async (req, res, next) => {
        try {
            const apiToken = req.header('authorization');
            if (apiToken?.startsWith('user:')) {
                const user = await accountService.getAccountByPersonalAccessToken(apiToken);
                req.user = user;
                accountService.addPATSeen(apiToken);
            }
        }
        catch (error) {
            if (error instanceof notfound_error_1.default) {
                logger.warn('Tried to use a PAT token for user that no longer existed', error);
            }
            else {
                logger.error(error);
            }
        }
        next();
    };
};
exports.default = patMiddleware;
//# sourceMappingURL=pat-middleware.js.map