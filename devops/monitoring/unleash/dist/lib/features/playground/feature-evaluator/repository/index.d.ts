import type { ClientFeaturesResponse, FeatureInterface } from '../feature';
import type { BootstrapProvider } from './bootstrap-provider';
import type { StorageProvider } from './storage-provider';
import type { Segment } from '../strategy/strategy';
import { EventEmitter } from 'stream';
export interface RepositoryInterface {
    getToggle(name: string): FeatureInterface;
    getToggles(): FeatureInterface[];
    getSegment(id: number): Segment | undefined;
    stop(): void;
    start(): Promise<void>;
}
export interface RepositoryOptions {
    appName: string;
    bootstrapProvider: BootstrapProvider;
    storageProvider: StorageProvider<ClientFeaturesResponse>;
}
export default class Repository extends EventEmitter {
    private timer;
    private appName;
    private bootstrapProvider;
    private storageProvider;
    private data;
    private segments;
    constructor({ appName, bootstrapProvider, storageProvider, }: RepositoryOptions);
    start(): Promise<void>;
    createSegmentLookup(segments: Segment[] | undefined): Map<number, Segment>;
    save(response: ClientFeaturesResponse): Promise<void>;
    notEmpty(content: ClientFeaturesResponse): boolean;
    loadBootstrap(): Promise<void>;
    private convertToMap;
    stop(): void;
    getSegment(segmentId: number): Segment | undefined;
    getToggle(name: string): FeatureInterface;
    getToggles(): FeatureInterface[];
}
//# sourceMappingURL=index.d.ts.map