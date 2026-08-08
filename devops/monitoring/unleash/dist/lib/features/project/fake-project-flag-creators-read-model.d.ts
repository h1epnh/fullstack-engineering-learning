import type { IProjectFlagCreatorsReadModel } from './project-flag-creators-read-model.type';
export declare class FakeProjectFlagCreatorsReadModel implements IProjectFlagCreatorsReadModel {
    getFlagCreators(project: string): Promise<{
        id: number;
        name: string;
    }[]>;
}
//# sourceMappingURL=fake-project-flag-creators-read-model.d.ts.map