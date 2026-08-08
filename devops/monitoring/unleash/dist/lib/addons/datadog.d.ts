import Addon from './addon';
import { type IAddonConfig, type IFlagResolver } from '../types';
import type { IEvent } from '../types/events';
interface IDatadogParameters {
    url: string;
    apiKey: string;
    sourceTypeName?: string;
    customHeaders?: string;
    bodyTemplate?: string;
}
export default class DatadogAddon extends Addon {
    private msgFormatter;
    flagResolver: IFlagResolver;
    constructor(config: IAddonConfig);
    handleEvent(event: IEvent, parameters: IDatadogParameters, integrationId: number): Promise<void>;
}
export {};
//# sourceMappingURL=datadog.d.ts.map