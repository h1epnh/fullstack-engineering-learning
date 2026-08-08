"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserSplashService {
    constructor({ userSplashStore }, { getLogger }) {
        this.userSplashStore = userSplashStore;
        this.logger = getLogger('services/user-splash-service.js');
    }
    async getAllUserSplashes(user) {
        if (user.isAPI) {
            return {};
        }
        try {
            return (await this.userSplashStore.getAllUserSplashes(user.id)).reduce((splashObject, splash) => ({
                ...splashObject,
                [splash.splashId]: splash.seen,
            }), {});
        }
        catch (err) {
            this.logger.error(err);
            return {};
        }
    }
    async getSplash(user_id, splash_id) {
        return this.userSplashStore.getSplash(user_id, splash_id);
    }
    async updateSplash(splash) {
        return this.userSplashStore.updateSplash(splash);
    }
}
exports.default = UserSplashService;
module.exports = UserSplashService;
//# sourceMappingURL=user-splash-service.js.map