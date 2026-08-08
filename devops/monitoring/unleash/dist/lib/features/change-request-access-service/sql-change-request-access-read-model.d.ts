import type { Db } from '../../db/db';
import type { AccessService } from '../../services';
import type User from '../../types/user';
import type { IChangeRequestAccessReadModel } from './change-request-access-read-model';
export declare class ChangeRequestAccessReadModel implements IChangeRequestAccessReadModel {
    private db;
    private accessService;
    constructor(db: Db, accessService: AccessService);
    canBypassChangeRequest(project: string, environment: string, user?: User): Promise<boolean>;
    canBypassChangeRequestForProject(project: string, user?: User): Promise<boolean>;
    isChangeRequestsEnabled(project: string, environment: string): Promise<boolean>;
    isChangeRequestsEnabledForProject(project: string): Promise<boolean>;
}
//# sourceMappingURL=sql-change-request-access-read-model.d.ts.map