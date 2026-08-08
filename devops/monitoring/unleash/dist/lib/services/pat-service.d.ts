import { type IAuditUser, type IUnleashConfig, type IUnleashStores } from '../types';
import type EventService from '../features/events/event-service';
import type { CreatePatSchema, PatSchema } from '../openapi';
export default class PatService {
    private config;
    private logger;
    private patStore;
    private eventService;
    constructor({ patStore }: Pick<IUnleashStores, 'patStore'>, config: IUnleashConfig, eventService: EventService);
    createPat(pat: CreatePatSchema, forUserId: number, auditUser: IAuditUser): Promise<PatSchema>;
    getAll(userId: number): Promise<PatSchema[]>;
    deletePat(id: number, forUserId: number, auditUser: IAuditUser): Promise<void>;
    validatePat({ description, expiresAt }: CreatePatSchema, userId: number): Promise<void>;
    private generateSecretKey;
}
//# sourceMappingURL=pat-service.d.ts.map