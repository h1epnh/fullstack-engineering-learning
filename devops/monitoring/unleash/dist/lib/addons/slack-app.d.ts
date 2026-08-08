import { type CodedError } from '@slack/web-api';
import Addon from './addon';
import { type IAddonConfig, type IFlagResolver } from '../types';
import type { IEvent } from '../types/events';
interface ISlackAppAddonParameters {
    accessToken: string;
    defaultChannels: string;
}
export default class SlackAppAddon extends Addon {
    private msgFormatter;
    flagResolver: IFlagResolver;
    private accessToken?;
    private slackClient?;
    constructor(args: IAddonConfig);
    handleEvent(event: IEvent, parameters: ISlackAppAddonParameters, integrationId: number): Promise<void>;
    getUniqueArray<T>(arr: T[]): T[];
    registerEarlyFailureEvent(integrationId: number, event: IEvent, earlyFailureMessage: string): void;
    findTaggedChannels({ tags }: Pick<IEvent, 'tags'>): string[];
    getDefaultChannels(defaultChannels?: string): string[];
    parseError(error: Error | CodedError): string;
}
export {};
//# sourceMappingURL=slack-app.d.ts.map