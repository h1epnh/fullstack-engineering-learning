"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createProjectService_1 = require("./createProjectService");
const test_config_1 = require("../../../test/config/test-config");
const alwaysOnFlagResolver = {
    isEnabled() {
        return true;
    },
};
test('Should not allow to exceed project limit on create', async () => {
    const LIMIT = 1;
    const projectService = (0, createProjectService_1.createFakeProjectService)({
        ...(0, test_config_1.createTestConfig)(),
        flagResolver: alwaysOnFlagResolver,
        resourceLimits: { projects: LIMIT },
        eventBus: {
            emit: () => { },
        },
    });
    const createProject = (name) => projectService.createProject({ name }, {}, {});
    await createProject('projectA');
    await expect(() => createProject('projectB')).rejects.toThrow("Failed to create project. You can't create more than the established limit of 1.");
});
test('Should not allow to exceed project limit on revive', async () => {
    const LIMIT = 1;
    const projectService = (0, createProjectService_1.createFakeProjectService)({
        ...(0, test_config_1.createTestConfig)(),
        flagResolver: alwaysOnFlagResolver,
        resourceLimits: { projects: LIMIT },
        eventBus: {
            emit: () => { },
        },
    });
    const createProject = (name) => projectService.createProject({ name, id: name }, {}, {});
    const archiveProject = (id) => projectService.archiveProject(id, {});
    const reviveProject = (id) => projectService.reviveProject(id, {});
    await createProject('projectA');
    await archiveProject('projectA');
    await createProject('projectB');
    await expect(() => reviveProject('projectA')).rejects.toThrow("Failed to create project. You can't create more than the established limit of 1.");
});
//# sourceMappingURL=project-service.limit.test.js.map