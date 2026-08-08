import type { IContextField, IContextFieldDto } from './context-field-store-type';
import type { IUnleashStores } from '../../types/stores';
import type { IUnleashConfig } from '../../types/option';
import type { ContextFieldStrategiesSchema } from '../../openapi/spec/context-field-strategies-schema';
import { type IAuditUser } from '../../types';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType';
import type EventService from '../events/event-service';
import type { LegalValueSchema } from '../../openapi';
declare class ContextService {
    private eventService;
    private contextFieldStore;
    private featureStrategiesStore;
    private logger;
    private flagResolver;
    private privateProjectChecker;
    constructor({ contextFieldStore, featureStrategiesStore, }: Pick<IUnleashStores, 'contextFieldStore' | 'featureStrategiesStore'>, { getLogger, flagResolver, }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>, eventService: EventService, privateProjectChecker: IPrivateProjectChecker);
    getAll(): Promise<IContextField[]>;
    getContextField(name: string): Promise<IContextField>;
    getStrategiesByContextField(name: string, userId: number): Promise<ContextFieldStrategiesSchema>;
    private mapStrategies;
    createContextField(value: IContextFieldDto, auditUser: IAuditUser): Promise<IContextField>;
    updateContextField(updatedContextField: IContextFieldDto, auditUser: IAuditUser): Promise<void>;
    updateLegalValue(contextFieldLegalValue: {
        name: string;
        legalValue: LegalValueSchema;
    }, auditUser: IAuditUser): Promise<void>;
    deleteLegalValue(contextFieldLegalValue: {
        name: string;
        legalValue: string;
    }, auditUser: IAuditUser): Promise<void>;
    deleteContextField(name: string, auditUser: IAuditUser): Promise<void>;
    validateUniqueName({ name, }: Pick<IContextFieldDto, 'name'>): Promise<void>;
    validateName(name: string): Promise<void>;
}
export default ContextService;
//# sourceMappingURL=context-service.d.ts.map