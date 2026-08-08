"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../lib/types");
const extract_user_1 = require("./extract-user");
describe('extractUsernameFromUser', () => {
    test('Should return the email if it exists', () => {
        const user = {
            email: 'ratatoskr@yggdrasil.com',
            username: 'ratatoskr',
        };
        expect((0, extract_user_1.extractUsernameFromUser)(user)).toBe(user.email);
    });
    test('Should return the username if it exists and email does not', () => {
        const user = {
            username: 'ratatoskr',
        };
        expect((0, extract_user_1.extractUsernameFromUser)(user)).toBe(user.username);
    });
    test('Should return the system user if neither email nor username exists', () => {
        const user = {};
        expect((0, extract_user_1.extractUsernameFromUser)(user)).toBe(types_1.SYSTEM_USER.username);
        expect((0, extract_user_1.extractUserIdFromUser)(user)).toBe(types_1.SYSTEM_USER.id);
    });
    test('Should return the system user if user is null', () => {
        const user = null;
        expect((0, extract_user_1.extractUsernameFromUser)(user)).toBe(types_1.SYSTEM_USER.username);
        expect((0, extract_user_1.extractUserIdFromUser)(user)).toBe(types_1.SYSTEM_USER.id);
    });
});
//# sourceMappingURL=extract-user.test.js.map