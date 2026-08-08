import Addon from './addon';
import { type IAddonConfig, type IFlagResolver } from '../types';
import type { IEvent } from '../types/events';
interface ISlackAddonParameters {
    url: string;
    username?: string;
    defaultChannel: string;
    emojiIcon?: string;
    customHeaders?: string;
}
export default class SlackAddon extends Addon {
    private msgFormatter;
    flagResolver: IFlagResolver;
    constructor(args: IAddonConfig);
    handleEvent(event: IEvent, parameters: ISlackAddonParameters, integrationId: number): Promise<void>;
    getUniqueArray<T>(arr: T[]): T[];
    findSlackChannels({ tags }: Pick<IEvent, 'tags'>): string[];
}
export {};
//# sourceMappingURL=slack.d.ts.map