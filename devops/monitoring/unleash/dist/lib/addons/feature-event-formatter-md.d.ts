import { type IEvent } from '../types';
export interface IFormattedEventData {
    label: string;
    text: string;
    url?: string;
}
export interface FeatureEventFormatter {
    format: (event: IEvent) => IFormattedEventData;
}
export declare enum LinkStyle {
    SLACK = 0,
    MD = 1
}
type FormatStyle = 'simple' | 'markdown';
interface IFeatureEventFormatterMdArgs {
    unleashUrl: string;
    linkStyle?: LinkStyle;
    formatStyle?: FormatStyle;
}
export declare class FeatureEventFormatterMd implements FeatureEventFormatter {
    private readonly unleashUrl;
    private readonly linkStyle;
    private readonly formatStyle;
    constructor({ unleashUrl, linkStyle, formatStyle, }: IFeatureEventFormatterMdArgs);
    /**
     * Returns the bold marker based on formatStyle, or wraps text with bold markers.
     * @param text Optional text to wrap with bold markers.
     * @returns Bold marker or bolded text.
     */
    bold(text?: string): string;
    generateChangeRequestLink(event: IEvent): string | undefined;
    featureLink(event: IEvent): string | undefined;
    generateFeatureLink(event: IEvent): string | undefined;
    generateProjectLink(event: IEvent): string | undefined;
    getStrategyTitle(event: IEvent): string | undefined;
    generateFeatureStrategyChangeText(event: IEvent): string | undefined;
    private applicationHostnameStrategyChangeText;
    private remoteAddressStrategyChangeText;
    private userWithIdStrategyChangeText;
    private listOfValuesStrategyChangeText;
    private flexibleRolloutStrategyChangeText;
    private defaultStrategyChangeText;
    private constraintChangeText;
    private segmentsChangeText;
    format(event: IEvent): IFormattedEventData;
}
export {};
//# sourceMappingURL=feature-event-formatter-md.d.ts.map