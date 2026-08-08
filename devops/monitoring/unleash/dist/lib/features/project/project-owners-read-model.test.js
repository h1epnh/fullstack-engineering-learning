"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../../test/e2e/helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const types_1 = require("../../types");
const util_1 = require("../../util");
const project_owners_read_model_1 = require("./project-owners-read-model");
jest.mock('../../util', () => ({
    ...jest.requireActual('../../util'),
    generateImageUrl: jest.fn((input) => `https://${input.image_url}`),
}));
const mockProjectData = (name) => ({
    name,
    id: name,
    featureCount: 0,
    memberCount: 0,
    mode: 'open',
    health: 100,
    createdAt: new Date(),
    favorite: false,
    lastReportedFlagUsage: null,
    lastUpdatedAt: null,
});
describe('unit tests', () => {
    test('maps owners to projects', () => {
        const projects = [
            { id: 'project1', name: 'Project one' },
            { id: 'project2', name: 'Project two' },
        ];
        const owners = {
            project1: [{ ownerType: 'user', name: 'Owner Name' }],
            project2: [{ ownerType: 'user', name: 'Owner Name' }],
        };
        const projectsWithOwners = project_owners_read_model_1.ProjectOwnersReadModel.addOwnerData(projects, owners);
        expect(projectsWithOwners).toMatchObject([
            {
                id: 'project1',
                name: 'Project one',
                owners: [{ name: 'Owner Name' }],
            },
            {
                id: 'project2',
                name: 'Project two',
                owners: [{ name: 'Owner Name' }],
            },
        ]);
    });
    test('returns "system" when a project has no owners', async () => {
        const projects = [{ id: 'project1' }, { id: 'project2' }];
        const owners = {};
        const projectsWithOwners = project_owners_read_model_1.ProjectOwnersReadModel.addOwnerData(projects, owners);
        expect(projectsWithOwners).toMatchObject([
            {
                id: 'project1',
                owners: [{ ownerType: 'system' }],
            },
            {
                id: 'project2',
                owners: [{ ownerType: 'system' }],
            },
        ]);
    });
});
let db;
let readModel;
let ownerRoleId;
let owner;
let owner2;
let member;
let group;
let group2;
beforeAll(async () => {
    db = await (0, database_init_1.default)('project_owners_read_model_serial', no_logger_1.default);
    readModel = new project_owners_read_model_1.ProjectOwnersReadModel(db.rawDatabase);
    ownerRoleId = (await db.stores.roleStore.getRoleByName(types_1.RoleName.OWNER)).id;
    const ownerData = {
        name: 'Owner Name',
        username: 'owner',
        email: 'owner@email.com',
        imageUrl: 'image-url-1',
    };
    const ownerData2 = {
        name: 'Second Owner Name',
        username: 'owner2',
        email: 'owner2@email.com',
        imageUrl: 'image-url-3',
    };
    const memberData = {
        name: 'Member Name',
        username: 'member',
        email: 'member@email.com',
        imageUrl: 'image-url-2',
    };
    // create users
    owner = await db.stores.userStore.insert(ownerData);
    member = await db.stores.userStore.insert(memberData);
    owner2 = await db.stores.userStore.insert(ownerData2);
    // create groups
    group = await db.stores.groupStore.create({ name: 'Group Name' });
    await db.stores.groupStore.addUserToGroups(owner.id, [group.id]);
    group2 = await db.stores.groupStore.create({ name: 'Second Group Name' });
    await db.stores.groupStore.addUserToGroups(member.id, [group.id]);
});
afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});
afterEach(async () => {
    db.stores.roleStore;
});
describe('integration tests', () => {
    test('returns an empty object if there are no projects', async () => {
        const owners = await readModel.getProjectOwnersDictionary();
        expect(owners).toStrictEqual({});
    });
    test('name takes precedence over username', async () => {
        const projectId = (0, util_1.randomId)();
        await db.stores.projectStore.create({ id: projectId, name: projectId });
        await db.stores.accessStore.addUserToRole(owner.id, ownerRoleId, projectId);
        const owners = await readModel.getProjectOwnersDictionary();
        expect(owners).toMatchObject({
            [projectId]: expect.arrayContaining([
                expect.objectContaining({ name: 'Owner Name' }),
            ]),
        });
    });
    test('gets project user owners', async () => {
        const projectId = (0, util_1.randomId)();
        await db.stores.projectStore.create({ id: projectId, name: projectId });
        await db.stores.accessStore.addUserToRole(owner.id, ownerRoleId, projectId);
        const owners = await readModel.getProjectOwnersDictionary();
        expect(owners).toMatchObject({
            [projectId]: [
                {
                    ownerType: 'user',
                    name: 'Owner Name',
                    email: 'owner@email.com',
                    imageUrl: 'https://image-url-1',
                },
            ],
        });
    });
    test('does not get regular project members', async () => {
        const projectId = (0, util_1.randomId)();
        await db.stores.projectStore.create({ id: projectId, name: projectId });
        const memberRole = await db.stores.roleStore.getRoleByName(types_1.RoleName.MEMBER);
        await db.stores.accessStore.addUserToRole(owner.id, ownerRoleId, projectId);
        await db.stores.accessStore.addUserToRole(member.id, memberRole.id, projectId);
        const owners = await readModel.getProjectOwnersDictionary();
        expect(owners).toMatchObject({
            [projectId]: [{ name: 'Owner Name' }],
        });
    });
    test('gets project group owners', async () => {
        const projectId = (0, util_1.randomId)();
        await db.stores.projectStore.create({ id: projectId, name: projectId });
        await db.stores.accessStore.addGroupToRole(group.id, ownerRoleId, '', projectId);
        const owners = await readModel.getProjectOwnersDictionary();
        expect(owners).toMatchObject({
            [projectId]: [
                {
                    ownerType: 'group',
                    name: 'Group Name',
                },
            ],
        });
    });
    test('users are listed before groups', async () => {
        const projectId = (0, util_1.randomId)();
        await db.stores.projectStore.create({ id: projectId, name: projectId });
        await db.stores.accessStore.addGroupToRole(group.id, ownerRoleId, '', projectId);
        await db.stores.accessStore.addUserToRole(owner.id, ownerRoleId, projectId);
        const owners = await readModel.getProjectOwnersDictionary();
        expect(owners).toMatchObject({
            [projectId]: [
                {
                    email: 'owner@email.com',
                    imageUrl: 'https://image-url-1',
                    name: 'Owner Name',
                    ownerType: 'user',
                },
                {
                    name: 'Group Name',
                    ownerType: 'group',
                },
            ],
        });
    });
    test('owners (users and groups) are sorted by when they were added; oldest first', async () => {
        const projectId = (0, util_1.randomId)();
        await db.stores.projectStore.create({ id: projectId, name: projectId });
        // Raw query in order to set the created_at date
        await db.rawDatabase('role_user').insert({
            user_id: owner2.id,
            role_id: ownerRoleId,
            project: projectId,
            created_at: new Date('2024-01-01T00:00:00.000Z'),
        });
        // Raw query in order to set the created_at date
        await db.rawDatabase('group_role').insert({
            group_id: group2.id,
            role_id: ownerRoleId,
            project: projectId,
            created_at: new Date('2024-01-01T00:00:00.000Z'),
        });
        await db.stores.accessStore.addGroupToRole(group.id, ownerRoleId, '', projectId);
        await db.stores.accessStore.addUserToRole(owner.id, ownerRoleId, projectId);
        const owners = await readModel.getProjectOwnersDictionary();
        expect(owners).toMatchObject({
            [projectId]: [
                {
                    email: 'owner2@email.com',
                    imageUrl: 'https://image-url-3',
                    name: 'Second Owner Name',
                    ownerType: 'user',
                },
                {
                    email: 'owner@email.com',
                    imageUrl: 'https://image-url-1',
                    name: 'Owner Name',
                    ownerType: 'user',
                },
                {
                    name: 'Second Group Name',
                    ownerType: 'group',
                },
                {
                    name: 'Group Name',
                    ownerType: 'group',
                },
            ],
        });
    });
    test('does not modify an empty array', async () => {
        const projectsWithOwners = await readModel.addOwners([]);
        expect(projectsWithOwners).toStrictEqual([]);
    });
    test('adds system owner when no owners are found', async () => {
        const projectIdA = (0, util_1.randomId)();
        const projectIdB = (0, util_1.randomId)();
        await db.stores.projectStore.create({
            id: projectIdA,
            name: projectIdA,
        });
        await db.stores.projectStore.create({
            id: projectIdB,
            name: projectIdB,
        });
        await db.stores.accessStore.addUserToRole(owner.id, ownerRoleId, projectIdB);
        const projectsWithOwners = await readModel.addOwners([
            mockProjectData(projectIdA),
            mockProjectData(projectIdB),
        ]);
        expect(projectsWithOwners).toMatchObject([
            { name: projectIdA, owners: [{ ownerType: 'system' }] },
            { name: projectIdB, owners: [{ ownerType: 'user' }] },
        ]);
    });
    test('filters out system and group owners when getting all user project owners', async () => {
        const createProject = async () => {
            const id = (0, util_1.randomId)();
            return db.stores.projectStore.create({
                id,
                name: id,
            });
        };
        const projectA = await createProject();
        const projectB = await createProject();
        const projectC = await createProject();
        await createProject(); // <- no owner
        await db.stores.accessStore.addUserToRole(owner.id, ownerRoleId, projectA.id);
        await db.stores.accessStore.addUserToRole(owner2.id, ownerRoleId, projectB.id);
        await db.stores.accessStore.addGroupToRole(group.id, ownerRoleId, '', projectC.id);
        const userOwners = await readModel.getAllUserProjectOwners();
        userOwners.sort((a, b) => a.name.localeCompare(b.name));
        expect(userOwners).toMatchObject([
            {
                name: owner.name,
                ownerType: 'user',
                email: owner.email,
                imageUrl: 'https://image-url-1',
            },
            {
                name: owner2.name,
                ownerType: 'user',
                email: owner2.email,
                imageUrl: 'https://image-url-3',
            },
        ]);
    });
    test('only returns projects listed in the projects input if provided', async () => {
        const createProject = async () => {
            const id = (0, util_1.randomId)();
            return db.stores.projectStore.create({
                id,
                name: id,
            });
        };
        const projectA = await createProject();
        const projectB = await createProject();
        await db.stores.accessStore.addUserToRole(owner.id, ownerRoleId, projectA.id);
        await db.stores.accessStore.addUserToRole(owner2.id, ownerRoleId, projectB.id);
        const noOwners = await readModel.getAllUserProjectOwners(new Set());
        expect(noOwners).toMatchObject([]);
        const onlyProjectA = await readModel.getAllUserProjectOwners(new Set([projectA.id]));
        expect(onlyProjectA).toMatchObject([
            {
                name: owner.name,
                ownerType: 'user',
                email: owner.email,
                imageUrl: 'https://image-url-1',
            },
        ]);
    });
});
//# sourceMappingURL=project-owners-read-model.test.js.map