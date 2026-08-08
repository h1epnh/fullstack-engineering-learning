"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAuditInfo = exports.extractAuditInfoFromUser = exports.extractUserInfo = exports.extractUserId = exports.extractUserIdFromUser = void 0;
exports.extractUsernameFromUser = extractUsernameFromUser;
exports.extractUsername = extractUsername;
const types_1 = require("../../lib/types");
function extractUsernameFromUser(user) {
    return (user?.email || user?.username || types_1.SYSTEM_USER_AUDIT.username);
}
function extractUsername(req) {
    return extractUsernameFromUser(req.user);
}
const extractUserIdFromUser = (user) => user?.id ||
    user?.internalAdminTokenUserId ||
    types_1.SYSTEM_USER.id;
exports.extractUserIdFromUser = extractUserIdFromUser;
const extractUserId = (req) => (0, exports.extractUserIdFromUser)(req.user);
exports.extractUserId = extractUserId;
const extractUserInfo = (req) => ({
    id: (0, exports.extractUserId)(req),
    username: extractUsername(req),
});
exports.extractUserInfo = extractUserInfo;
const extractAuditInfoFromUser = (user, ip = '127.0.0.1') => ({
    id: (0, exports.extractUserIdFromUser)(user),
    username: extractUsernameFromUser(user),
    ip,
});
exports.extractAuditInfoFromUser = extractAuditInfoFromUser;
const extractAuditInfo = (req) => ({
    id: (0, exports.extractUserId)(req),
    username: extractUsername(req),
    ip: req.ip,
});
exports.extractAuditInfo = extractAuditInfo;
//# sourceMappingURL=extract-user.js.map