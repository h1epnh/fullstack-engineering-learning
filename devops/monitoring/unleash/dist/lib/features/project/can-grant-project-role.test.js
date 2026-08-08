"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const can_grant_project_role_1 = require("./can-grant-project-role");
describe('canGrantProjectRole', () => {
    test('should return true if the granter has all the permissions the receiver needs', () => {
        const granterPermissions = [
            {
                project: 'test',
                environment: undefined,
                permission: 'CREATE_FEATURE',
            },
            {
                project: 'test',
                environment: 'production',
                permission: 'UPDATE_FEATURE_ENVIRONMENT',
            },
            {
                project: 'test',
                environment: 'production',
                permission: 'APPROVE_CHANGE_REQUEST',
            },
        ];
        const receiverPermissions = [
            {
                id: 28,
                name: 'UPDATE_FEATURE_ENVIRONMENT',
                environment: 'production',
                displayName: 'Enable/disable flags',
                type: 'environment',
            },
            {
                id: 29,
                name: 'APPROVE_CHANGE_REQUEST',
                environment: 'production',
                displayName: 'Enable/disable flags',
                type: 'environment',
            },
        ];
        (0, can_grant_project_role_1.canGrantProjectRole)(granterPermissions, receiverPermissions);
    });
    test('should return false if the granter and receiver permissions have different environments', () => {
        const granterPermissions = [
            {
                project: 'test',
                environment: 'production',
                permission: 'UPDATE_FEATURE_ENVIRONMENT',
            },
            {
                project: 'test',
                environment: 'production',
                permission: 'APPROVE_CHANGE_REQUEST',
            },
        ];
        const receiverPermissions = [
            {
                id: 28,
                name: 'UPDATE_FEATURE_ENVIRONMENT',
                environment: 'development',
                displayName: 'Enable/disable flags',
                type: 'environment',
            },
            {
                id: 29,
                name: 'APPROVE_CHANGE_REQUEST',
                environment: 'development',
                displayName: 'Enable/disable flags',
                type: 'environment',
            },
        ];
        expect((0, can_grant_project_role_1.canGrantProjectRole)(granterPermissions, receiverPermissions)).toBeFalsy();
    });
    test('should return false if the granter does not have all receiver permissions', () => {
        const granterPermissions = [
            {
                project: 'test',
                environment: 'production',
                permission: 'UPDATE_FEATURE_ENVIRONMENT',
            },
            {
                project: 'test',
                environment: 'production',
                permission: 'APPROVE_CHANGE_REQUEST',
            },
        ];
        const receiverPermissions = [
            {
                id: 28,
                name: 'UPDATE_FEATURE_ENVIRONMENT',
                environment: 'production',
                displayName: 'Enable/disable flags',
                type: 'environment',
            },
            {
                id: 29,
                name: 'APPROVE_CHANGE_REQUEST',
                environment: 'production',
                displayName: 'Enable/disable flags',
                type: 'environment',
            },
            {
                id: 26,
                name: 'UPDATE_FEATURE_STRATEGY',
                environment: 'production',
                displayName: 'Update activation strategies',
                type: 'environment',
            },
        ];
        expect((0, can_grant_project_role_1.canGrantProjectRole)(granterPermissions, receiverPermissions)).toBeFalsy();
    });
});
//# sourceMappingURL=can-grant-project-role.test.js.map