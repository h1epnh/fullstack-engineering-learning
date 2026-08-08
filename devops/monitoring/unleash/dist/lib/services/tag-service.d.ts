import type { IUnleashStores } from '../types/stores';
import type { IUnleashConfig } from '../types/option';
import type { ITag } from '../types/model';
import type EventService from '../features/events/event-service';
import type { IAuditUser } from '../types';
export default class TagService {
    private tagStore;
    private eventService;
    private logger;
    constructor({ tagStore }: Pick<IUnleashStores, 'tagStore'>, { getLogger }: Pick<IUnleashConfig, 'getLogger'>, eventService: EventService);
    getTags(): Promise<ITag[]>;
    getTagsByType(type: string): Promise<ITag[]>;
    getTag({ type, value }: ITag): Promise<ITag>;
    validateUnique(tag: ITag): Promise<void>;
    validate(tag: ITag): Promise<ITag>;
    createTag(tag: ITag, auditUser: IAuditUser): Promise<ITag>;
    deleteTag(tag: ITag, auditUser: IAuditUser): Promise<void>;
}
//# sourceMappingURL=tag-service.d.ts.map