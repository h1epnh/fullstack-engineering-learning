import type { FeatureEnvironmentKey, IFeatureEnvironmentStore } from '../../lib/types/stores/feature-environment-store';
import type { IFeatureEnvironment, IVariant } from '../../lib/types/model';
export default class FakeFeatureEnvironmentStore implements IFeatureEnvironmentStore {
    featureEnvironments: IFeatureEnvironment[];
    addEnvironmentToFeature(featureName: string, environment: string, enabled: boolean): Promise<void>;
    addVariantsToFeatureEnvironment(featureName: string, environment: string, variants: IVariant[]): Promise<void>;
    setVariantsToFeatureEnvironments(featureName: string, environments: string[], variants: IVariant[]): Promise<void>;
    delete(key: FeatureEnvironmentKey): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    disconnectFeatures(environment: string, project: string): Promise<void>;
    exists(key: FeatureEnvironmentKey): Promise<boolean>;
    featureHasEnvironment(environment: string, featureName: string): Promise<boolean>;
    get(key: FeatureEnvironmentKey): Promise<IFeatureEnvironment>;
    getAll(): Promise<IFeatureEnvironment[]>;
    getEnvironmentMetaData(environment: string, featureName: string): Promise<IFeatureEnvironment>;
    isEnvironmentEnabled(featureName: string, environment: string): Promise<boolean>;
    removeEnvironmentForFeature(featureName: string, environment: string): Promise<void>;
    setEnvironmentEnabledStatus(environment: string, featureName: string, enabled: boolean): Promise<number>;
    connectProject(environment: string, projectId: string): Promise<void>;
    connectFeatures(environment: string, projectId: string): Promise<void>;
    disconnectProject(environment: string, projectId: string): Promise<void>;
    connectFeatureToEnvironmentsForProject(featureName: string, projectId: string): Promise<void>;
    disableEnvironmentIfNoStrategies(featureName: string, environment: string): Promise<void>;
    copyEnvironmentFeaturesByProjects(sourceEnvironment: string, destinationEnvironment: string, projects: string[]): Promise<void>;
    cloneStrategies(sourceEnvironment: string, destinationEnvironment: string): Promise<void>;
    addFeatureEnvironment(featureEnvironment: IFeatureEnvironment): Promise<void>;
    getEnvironmentsForFeature(featureName: string): Promise<IFeatureEnvironment[]>;
    getAllByFeatures(features: string[], environment?: string): Promise<IFeatureEnvironment[]>;
    variantExists(featureName: string): Promise<boolean>;
}
//# sourceMappingURL=fake-feature-environment-store.d.ts.map