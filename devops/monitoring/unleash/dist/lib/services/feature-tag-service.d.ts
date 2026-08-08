import type { IUnleashConfig } from '../types/option';
import type { IUnleashStores } from '../types/stores';
import type { ITag } from '../types/model';
import type EventService from '../features/events/event-service';
import type { IAuditUser } from '../types';
declare class FeatureTagService {
    private tagStore;
    private featureTagStore;
    private featureToggleStore;
    private eventService;
    private logger;
    constructor({ tagStore, featureTagStore, featureToggleStore, }: Pick<IUnleashStores, 'tagStore' | 'featureTagStore' | 'featureToggleStore'>, { getLogger }: Pick<IUnleashConfig, 'getLogger'>, eventService: EventService);
    listTags(featureName: string): Promise<ITag[]>;
    listFeatures(tagValue: string): Promise<string[]>;
    addTag(featureName: string, tag: ITag, auditUser: IAuditUser): Promise<ITag>;
    updateTags(featureNames: string[], addedTags: ITag[], removedTags: ITag[], auditUser: IAuditUser): Promise<void>;
    createTagIfNeeded(tag: ITag, auditUser: IAuditUser): Promise<void>;
    removeTag(featureName: string, tag: ITag, auditUser: IAuditUser): Promise<void>;
}
export default FeatureTagService;
//# sourceMappingURL=feature-tag-service.d.ts.map