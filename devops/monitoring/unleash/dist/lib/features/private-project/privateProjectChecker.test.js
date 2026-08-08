"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const privateProjectChecker_1 = require("./privateProjectChecker");
test('filter user accessible projects', async () => {
    const checker = new privateProjectChecker_1.PrivateProjectChecker({
        privateProjectStore: {
            async getUserAccessibleProjects() {
                return {
                    mode: 'limited',
                    projects: ['projectA', 'projectB'],
                };
            },
        },
    }, { isEnterprise: true });
    const projects = await checker.filterUserAccessibleProjects(123, [
        'projectA',
        'projectC',
    ]);
    expect(projects).toEqual(['projectA']);
});
test('do not filter for non enterprise', async () => {
    const checker = new privateProjectChecker_1.PrivateProjectChecker({
        privateProjectStore: {
            async getUserAccessibleProjects() {
                return {
                    mode: 'limited',
                    projects: ['projectA', 'projectB'],
                };
            },
        },
    }, { isEnterprise: false });
    const projects = await checker.filterUserAccessibleProjects(123, [
        'projectA',
        'projectC',
    ]);
    expect(projects).toEqual(['projectA', 'projectC']);
});
test('do not filter for all mode', async () => {
    const checker = new privateProjectChecker_1.PrivateProjectChecker({
        privateProjectStore: {
            async getUserAccessibleProjects() {
                return { mode: 'all' };
            },
        },
    }, { isEnterprise: false });
    const projects = await checker.filterUserAccessibleProjects(123, [
        'projectA',
        'projectC',
    ]);
    expect(projects).toEqual(['projectA', 'projectC']);
});
//# sourceMappingURL=privateProjectChecker.test.js.map