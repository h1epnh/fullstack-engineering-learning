export type FeatureDependencyId = {
    parent: string;
    child: string;
};
export type FeatureDependency = {
    parent: string;
    child: string;
    enabled: true;
    variants?: string[];
} | {
    parent: string;
    child: string;
    enabled: false;
};
//# sourceMappingURL=dependent-features.d.ts.map