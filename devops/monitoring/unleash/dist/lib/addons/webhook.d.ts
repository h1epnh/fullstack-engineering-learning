import Addon from './addon';
import type { IEvent } from '../types/events';
import { type IAddonConfig, type IFlagResolver } from '../types';
interface IParameters {
    url: string;
    serviceName?: string;
    bodyTemplate?: string;
    contentType?: string;
    authorization?: string;
    customHeaders?: string;
}
export default class Webhook extends Addon {
    private msgFormatter;
    flagResolver: IFlagResolver;
    constructor(args: IAddonConfig);
    handleEvent(event: IEvent, parameters: IParameters, integrationId: number): Promise<void>;
}
export {};
//# sourceMappingURL=webhook.d.ts.map