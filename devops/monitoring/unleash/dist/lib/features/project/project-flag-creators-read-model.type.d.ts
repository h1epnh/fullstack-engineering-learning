export interface IProjectFlagCreatorsReadModel {
    getFlagCreators(project: string): Promise<Array<{
        id: number;
        name: string;
    }>>;
}
//# sourceMappingURL=project-flag-creators-read-model.type.d.ts.map