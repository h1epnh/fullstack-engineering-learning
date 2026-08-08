import Addon from './addon';
import { type IAddonConfig, type IEvent, type IFlagResolver } from '../types';
export interface INewRelicParameters {
    url: string;
    licenseKey: string;
    customHeaders?: string;
    bodyTemplate?: string;
}
export default class NewRelicAddon extends Addon {
    private msgFormatter;
    flagResolver: IFlagResolver;
    constructor(config: IAddonConfig);
    handleEvent(event: IEvent, parameters: INewRelicParameters, integrationId: number): Promise<void>;
}
//# sourceMappingURL=new-relic.d.ts.map