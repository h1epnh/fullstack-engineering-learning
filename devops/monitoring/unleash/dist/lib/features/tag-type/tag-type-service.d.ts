import type { IUnleashStores } from '../../types/stores';
import type { ITagType } from './tag-type-store-type';
import type { IUnleashConfig } from '../../types/option';
import type EventService from '../events/event-service';
import type { IAuditUser } from '../../types';
export default class TagTypeService {
    private tagTypeStore;
    private eventService;
    private logger;
    constructor({ tagTypeStore }: Pick<IUnleashStores, 'tagTypeStore'>, { getLogger }: Pick<IUnleashConfig, 'getLogger'>, eventService: EventService);
    getAll(): Promise<ITagType[]>;
    getTagType(name: string): Promise<ITagType>;
    createTagType(newTagType: ITagType, auditUser: IAuditUser): Promise<ITagType>;
    validateUnique(name: string): Promise<boolean>;
    validate(tagType: Partial<ITagType> | undefined): Promise<void>;
    deleteTagType(name: string, auditUser: IAuditUser): Promise<void>;
    updateTagType(updatedTagType: ITagType, auditUser: IAuditUser): Promise<ITagType>;
}
//# sourceMappingURL=tag-type-service.d.ts.map