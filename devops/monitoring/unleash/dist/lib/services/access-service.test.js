"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const name_exists_error_1 = __importDefault(require("../error/name-exists-error"));
const no_logger_1 = __importDefault(require("../../test/fixtures/no-logger"));
const createAccessService_1 = require("../features/access/createAccessService");
const access_service_1 = require("./access-service");
const test_config_1 = require("../../test/config/test-config");
const constants_1 = require("../util/constants");
const fake_group_store_1 = __importDefault(require("../../test/fixtures/fake-group-store"));
const fake_account_store_1 = require("../../test/fixtures/fake-account-store");
const fake_role_store_1 = __importDefault(require("../../test/fixtures/fake-role-store"));
const fake_environment_store_1 = __importDefault(require("../features/project-environments/fake-environment-store"));
const fake_access_store_1 = __importDefault(require("../../test/fixtures/fake-access-store"));
const group_service_1 = require("../services/group-service");
const types_1 = require("../../lib/types");
const bad_data_error_1 = __importDefault(require("../../lib/error/bad-data-error"));
const createEventsService_1 = require("../../lib/features/events/createEventsService");
const createAccessReadModel_1 = require("../features/access/createAccessReadModel");
function getSetup() {
    const config = (0, test_config_1.createTestConfig)({
        getLogger: no_logger_1.default,
    });
    const { accessService, eventStore, accessStore } = (0, createAccessService_1.createFakeAccessService)(config);
    return {
        accessService,
        eventStore,
        accessStore,
        accessReadModel: (0, createAccessReadModel_1.createFakeAccessReadModel)(accessStore),
    };
}
test('should fail when name exists', async () => {
    const { accessService } = getSetup();
    const existingRole = await accessService.createRole({
        name: 'existing role',
        description: 'description',
        permissions: [],
        createdByUserId: -9999,
    }, types_1.SYSTEM_USER_AUDIT);
    expect(accessService.validateRole(existingRole)).rejects.toThrow(new name_exists_error_1.default(`There already exists a role with the name ${existingRole.name}`));
});
test('should validate a role without permissions', async () => {
    const { accessService } = getSetup();
    const withoutPermissions = {
        name: 'name of the role',
        description: 'description',
    };
    expect(await accessService.validateRole(withoutPermissions)).toEqual(withoutPermissions);
});
test('should complete description field when not present', async () => {
    const { accessService } = getSetup();
    const withoutDescription = {
        name: 'name of the role',
    };
    expect(await accessService.validateRole(withoutDescription)).toEqual({
        name: 'name of the role',
        description: '',
    });
});
test('should accept empty permissions', async () => {
    const { accessService } = getSetup();
    const withEmptyPermissions = {
        name: 'name of the role',
        description: 'description',
        permissions: [],
    };
    expect(await accessService.validateRole(withEmptyPermissions)).toEqual({
        name: 'name of the role',
        description: 'description',
        permissions: [],
    });
});
test('should not accept empty names', async () => {
    const { accessService } = getSetup();
    const withWhitespaceName = {
        name: '    ',
        description: 'description',
        permissions: [],
    };
    await expect(accessService.validateRole(withWhitespaceName)).rejects.toThrow('"name" is not allowed to be empty');
});
test('should trim leading and trailing whitespace from names', async () => {
    const { accessService } = getSetup();
    const withUntrimmedName = {
        name: '   untrimmed ',
        description: 'description',
        permissions: [],
    };
    expect(await accessService.validateRole(withUntrimmedName)).toEqual({
        name: 'untrimmed',
        description: 'description',
        permissions: [],
    });
});
test('should complete environment field of permissions when not present', async () => {
    const { accessService } = getSetup();
    const withoutEnvironmentInPermissions = {
        name: 'name of the role',
        description: 'description',
        permissions: [
            {
                id: 1,
            },
        ],
    };
    expect(await accessService.validateRole(withoutEnvironmentInPermissions)).toEqual({
        name: 'name of the role',
        description: 'description',
        permissions: [
            {
                id: 1,
                environment: '',
            },
        ],
    });
});
test('should return the same object when all fields are valid and present', async () => {
    const { accessService } = getSetup();
    const roleWithAllFields = {
        name: 'name of the role',
        description: 'description',
        permissions: [
            {
                id: 1,
                environment: 'development',
            },
        ],
    };
    expect(await accessService.validateRole(roleWithAllFields)).toEqual({
        name: 'name of the role',
        description: 'description',
        permissions: [
            {
                id: 1,
                environment: 'development',
            },
        ],
    });
});
test('should be able to validate and cleanup with additional properties', async () => {
    const { accessService } = getSetup();
    const base = {
        name: 'name of the role',
        description: 'description',
        additional: 'property',
        permissions: [
            {
                id: 1,
                environment: 'development',
                name: 'name',
                displayName: 'displayName',
                type: 'type',
                additional: 'property',
            },
        ],
    };
    expect(await accessService.validateRole(base)).toEqual({
        name: 'name of the role',
        description: 'description',
        permissions: [
            {
                id: 1,
                name: 'name',
                environment: 'development',
            },
        ],
    });
});
test('user with custom root role should get a user root role', async () => {
    const { accessService, eventStore } = getSetup();
    const createRoleInput = {
        name: 'custom-root-role',
        description: 'test custom root role',
        type: constants_1.CUSTOM_ROOT_ROLE_TYPE,
        createdByUserId: -9999,
        permissions: [
            {
                id: 1,
                environment: 'development',
                name: 'fake',
            },
            {
                name: 'root-fake-permission',
            },
        ],
    };
    const customRootRole = await accessService.createRole(createRoleInput, types_1.SYSTEM_USER_AUDIT);
    const user = {
        id: 1,
        rootRole: customRootRole.id,
    };
    await accessService.setUserRootRole(user.id, customRootRole.id);
    const role = await accessService.getRootRoleForUser(user.id);
    expect(role.name).toBe('custom-root-role');
    const events = await eventStore.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
        type: types_1.ROLE_CREATED,
        createdBy: types_1.SYSTEM_USER_AUDIT.username,
        createdByUserId: types_1.SYSTEM_USER.id,
        ip: types_1.SYSTEM_USER_AUDIT.ip,
        data: {
            id: 0,
            name: 'custom-root-role',
            description: 'test custom root role',
            type: constants_1.CUSTOM_ROOT_ROLE_TYPE,
            // make sure we have a cleaned up version of permissions in the event
            permissions: [
                { environment: 'development', name: 'fake' },
                { name: 'root-fake-permission', environment: undefined },
            ],
        },
    });
});
test('throws error when trying to delete a project role in use by group', async () => {
    const groupIdResultOverride = async () => {
        return [1];
    };
    const config = (0, test_config_1.createTestConfig)({
        getLogger: no_logger_1.default,
    });
    const groupStore = new fake_group_store_1.default();
    groupStore.getAllWithId = async () => {
        return [{ id: 1, name: 'group' }];
    };
    const accountStore = new fake_account_store_1.FakeAccountStore();
    const roleStore = new fake_role_store_1.default();
    const environmentStore = new fake_environment_store_1.default();
    const accessStore = new fake_access_store_1.default();
    accessStore.getGroupIdsForRole = groupIdResultOverride;
    accessStore.getUserIdsForRole = async () => {
        return [];
    };
    accessStore.get = async () => {
        return { id: 1, type: 'custom', name: 'project role' };
    };
    const eventService = (0, createEventsService_1.createFakeEventsService)(config);
    const groupService = new group_service_1.GroupService({ groupStore, accountStore }, { getLogger: no_logger_1.default }, eventService);
    const accessService = new access_service_1.AccessService({
        accessStore,
        accountStore,
        roleStore,
        environmentStore,
    }, config, groupService, eventService);
    try {
        await accessService.deleteRole(1, types_1.SYSTEM_USER_AUDIT);
    }
    catch (e) {
        expect(e.toString()).toBe('RoleInUseError: Role is in use by users(0) or groups(1). You cannot delete a role that is in use without first removing the role from the users and groups.');
    }
});
describe('addAccessToProject', () => {
    test('should throw an error when you try add access with an empty list of roles', async () => {
        const { accessService } = getSetup();
        await expect(() => accessService.addAccessToProject([], [1], [1], 'projectId', 'createdBy')).rejects.toThrow(bad_data_error_1.default);
    });
});
test('should return true if user has admin role', async () => {
    const { accessReadModel, accessStore } = getSetup();
    const userId = 1;
    accessStore.getRolesForUserId = jest
        .fn()
        .mockResolvedValue([{ id: 1, name: 'ADMIN', type: 'custom' }]);
    const result = await accessReadModel.isRootAdmin(userId);
    expect(result).toBe(true);
    expect(accessStore.getRolesForUserId).toHaveBeenCalledWith(userId);
});
test('should return false if user does not have admin role', async () => {
    const { accessReadModel, accessStore } = getSetup();
    const userId = 2;
    accessStore.getRolesForUserId = jest
        .fn()
        .mockResolvedValue([{ id: 2, name: 'user', type: 'custom' }]);
    const result = await accessReadModel.isRootAdmin(userId);
    expect(result).toBe(false);
    expect(accessStore.getRolesForUserId).toHaveBeenCalledWith(userId);
});
//# sourceMappingURL=access-service.test.js.map