import type { IUnleashConfig } from '../types/option';
import type { Request } from 'express';
export type ClientSpecFeature = 'segments' | 'deltaApi';
export declare class ClientSpecService {
    private readonly logger;
    private readonly clientSpecHeader;
    private readonly clientSpecFeatures;
    constructor(config: Pick<IUnleashConfig, 'getLogger'>);
    requestSupportsSpec(request: Request, feature: ClientSpecFeature): boolean;
    versionSupportsSpec(feature: ClientSpecFeature, version: string | undefined): boolean;
}
//# sourceMappingURL=client-spec-service.d.ts.map