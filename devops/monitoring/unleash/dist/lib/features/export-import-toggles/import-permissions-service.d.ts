import type { IImportTogglesStore } from './import-toggles-store-type';
import type { AccessService, ContextService, TagTypeService } from '../../services';
import type { ImportTogglesSchema } from '../../openapi';
import type { IUser } from '../../types/user';
export type Mode = 'regular' | 'change_request';
export declare class ImportPermissionsService {
    private importTogglesStore;
    private accessService;
    private tagTypeService;
    private contextService;
    private getNewTagTypes;
    private getNewContextFields;
    constructor(importTogglesStore: IImportTogglesStore, accessService: AccessService, tagTypeService: TagTypeService, contextService: ContextService);
    getMissingPermissions(dto: ImportTogglesSchema, user: IUser, mode: Mode): Promise<string[]>;
    verifyPermissions(dto: ImportTogglesSchema, user: IUser, mode: Mode): Promise<void>;
}
//# sourceMappingURL=import-permissions-service.d.ts.map