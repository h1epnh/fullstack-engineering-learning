import Addon from './addon';
import { type IAddonConfig, type IFlagResolver } from '../types';
import type { IEvent } from '../types/events';
interface ITeamsParameters {
    url: string;
    customHeaders?: string;
}
export default class TeamsAddon extends Addon {
    private msgFormatter;
    flagResolver: IFlagResolver;
    constructor(args: IAddonConfig);
    handleEvent(event: IEvent, parameters: ITeamsParameters, integrationId: number): Promise<void>;
}
export {};
//# sourceMappingURL=teams.d.ts.map