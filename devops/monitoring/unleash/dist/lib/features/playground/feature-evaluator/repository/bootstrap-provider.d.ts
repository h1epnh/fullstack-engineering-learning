import type { ClientFeaturesResponse, FeatureInterface } from '../feature';
import type { Segment } from '../strategy/strategy';
export interface BootstrapProvider {
    readBootstrap(): Promise<ClientFeaturesResponse | undefined>;
}
export interface BootstrapOptions {
    data: FeatureInterface[];
    segments?: Segment[];
}
export declare class DefaultBootstrapProvider implements BootstrapProvider {
    private data?;
    private segments?;
    constructor(options: BootstrapOptions);
    readBootstrap(): Promise<ClientFeaturesResponse | undefined>;
}
export declare function resolveBootstrapProvider(options: BootstrapOptions): BootstrapProvider;
//# sourceMappingURL=bootstrap-provider.d.ts.map