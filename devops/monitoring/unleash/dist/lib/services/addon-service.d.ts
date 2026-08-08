import memoizee from 'memoizee';
import { type IAddonProviders } from '../addons';
import type { IFeatureToggleStore } from '../features/feature-toggle/types/feature-toggle-store-type';
import type { Logger } from '../logger';
import type TagTypeService from '../features/tag-type/tag-type-service';
import type { IAddon, IAddonDto, IAddonStore } from '../types/stores/addon-store';
import { type IAuditUser, type IUnleashConfig, type IUnleashStores } from '../types';
import type { IAddonDefinition } from '../types/model';
import type EventService from '../features/events/event-service';
interface ISensitiveParams {
    [key: string]: string[];
}
export default class AddonService {
    addonStore: IAddonStore;
    featureToggleStore: IFeatureToggleStore;
    logger: Logger;
    tagTypeService: TagTypeService;
    eventService: EventService;
    addonProviders: IAddonProviders;
    sensitiveParams: ISensitiveParams;
    fetchAddonConfigs: (() => Promise<IAddon[]>) & memoizee.Memoized<() => Promise<IAddon[]>>;
    constructor({ addonStore, featureToggleStore, }: Pick<IUnleashStores, 'addonStore' | 'featureToggleStore'>, { getLogger, server, flagResolver, eventBus, }: Pick<IUnleashConfig, 'getLogger' | 'server' | 'flagResolver' | 'eventBus'>, tagTypeService: TagTypeService, eventService: EventService, integrationEventsService: any, addons?: IAddonProviders);
    loadSensitiveParams(addonProviders: IAddonProviders): ISensitiveParams;
    registerEventHandler(): void;
    handleEvent(eventName: string): (IEvent: any) => void;
    getAddons(): Promise<IAddon[]>;
    filterSensitiveFields(addonConfig: IAddon): IAddon;
    getAddon(id: number): Promise<IAddon>;
    getProviderDefinitions(): IAddonDefinition[];
    addTagTypes(providerName: string): Promise<void>;
    createAddon(data: IAddonDto, auditUser: IAuditUser): Promise<IAddon>;
    updateAddon(id: number, data: IAddonDto, auditUser: IAuditUser): Promise<IAddon>;
    removeAddon(id: number, auditUser: IAuditUser): Promise<void>;
    validateKnownProvider(config: Partial<IAddonDto>): Promise<boolean>;
    validateRequiredParameters({ provider, parameters, }: {
        provider: any;
        parameters: any;
    }): Promise<boolean>;
    destroy(): void;
}
export {};
//# sourceMappingURL=addon-service.d.ts.map