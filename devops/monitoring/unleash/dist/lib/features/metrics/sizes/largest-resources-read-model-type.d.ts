export interface ILargestResourcesReadModel {
    getLargestProjectEnvironments(limit: number): Promise<Array<{
        project: string;
        environment: string;
        size: number;
    }>>;
    getLargestFeatureEnvironments(limit: number): Promise<Array<{
        feature: string;
        environment: string;
        size: number;
    }>>;
}
//# sourceMappingURL=largest-resources-read-model-type.d.ts.map