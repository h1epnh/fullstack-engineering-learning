import type { ILargestResourcesReadModel } from './largest-resources-read-model-type';
export declare class FakeLargestResourcesReadModel implements ILargestResourcesReadModel {
    getLargestProjectEnvironments(limit: number): Promise<{
        project: string;
        environment: string;
        size: number;
    }[]>;
    getLargestFeatureEnvironments(limit: number): Promise<{
        feature: string;
        environment: string;
        size: number;
    }[]>;
}
//# sourceMappingURL=fake-largest-resources-read-model.d.ts.map