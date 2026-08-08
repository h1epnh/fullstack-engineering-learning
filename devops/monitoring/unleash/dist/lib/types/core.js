"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSTEM_USER_ID = exports.TEST_AUDIT_USER = exports.SYSTEM_USER_AUDIT = exports.ADMIN_TOKEN_USER = exports.SYSTEM_USER = void 0;
exports.SYSTEM_USER = {
    id: -1337,
    imageUrl: '',
    isAPI: false,
    name: 'Unleash System',
    permissions: [],
    username: 'unleash_system_user',
};
exports.ADMIN_TOKEN_USER = {
    id: -42,
    imageUrl: '',
    isAPI: true,
    name: 'Unleash Admin Token',
    permissions: [],
    username: 'unleash_admin_token',
};
exports.SYSTEM_USER_AUDIT = {
    id: exports.SYSTEM_USER.id,
    username: exports.SYSTEM_USER.username,
    ip: '',
};
exports.TEST_AUDIT_USER = {
    id: -9999,
    username: 'test@example.com',
    ip: '999.999.999.999',
};
exports.SYSTEM_USER_ID = exports.SYSTEM_USER.id;
//# sourceMappingURL=core.js.map