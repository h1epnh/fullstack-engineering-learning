"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const adminUser = () => {
    return {
        hook(app) {
            app.use((req, res, next) => {
                req.user = {
                    isAPI: true,
                    id: 1,
                    email: 'unknown',
                    permissions: ['ADMIN'],
                };
                next();
            });
        },
    };
};
exports.default = adminUser;
//# sourceMappingURL=permissions.js.map