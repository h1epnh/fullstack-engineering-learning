import { type Variant } from 'unleash-client';
export type IFlagKey = 'accessLogs' | 'anonymiseEventLog' | 'encryptEmails' | 'enableLicense' | 'enableLicenseChecker' | 'embedProxy' | 'embedProxyFrontend' | 'responseTimeWithAppNameKillSwitch' | 'maintenanceMode' | 'messageBanner' | 'caseInsensitiveInOperators' | 'strictSchemaValidation' | 'personalAccessTokensKillSwitch' | 'migrationLock' | 'demo' | 'googleAuthEnabled' | 'disableBulkToggle' | 'disableNotifications' | 'advancedPlayground' | 'filterInvalidClientMetrics' | 'filterExistingFlagNames' | 'disableMetrics' | 'signals' | 'automatedActions' | 'celebrateUnleash' | 'feedbackPosting' | 'extendedUsageMetrics' | 'feedbackComments' | 'showInactiveUsers' | 'killScheduledChangeRequestCache' | 'estimateTrafficDataCost' | 'useMemoizedActiveTokens' | 'queryMissingTokens' | 'userAccessUIEnabled' | 'disableUpdateMaxRevisionId' | 'disablePublishUnannouncedEvents' | 'outdatedSdksBanner' | 'responseTimeMetricsFix' | 'disableShowContextFieldSelectionValues' | 'manyStrategiesPagination' | 'enableLegacyVariants' | 'extendedMetrics' | 'removeUnsafeInlineStyleSrc' | 'projectRoleAssignment' | 'originMiddlewareRequestLogging' | 'webhookDomainLogging' | 'releasePlans' | 'productivityReportEmail' | 'productivityReportUnsubscribers' | 'enterprise-payg' | 'flagOverviewRedesign' | 'showUserDeviceCount' | 'memorizeStats' | 'streaming' | 'etagVariant' | 'deltaApi' | 'uniqueSdkTracking' | 'consumptionModel' | 'teamsIntegrationChangeRequests' | 'edgeObservability' | 'simplifyDisableFeature' | 'adminNavUI' | 'tagTypeColor' | 'globalChangeRequestConfig';
export type IFlags = Partial<{
    [key in IFlagKey]: boolean | Variant;
}>;
export declare const defaultExperimentalOptions: IExperimentalOptions;
export interface IExperimentalOptions {
    flags: IFlags;
    externalResolver: IExternalFlagResolver;
}
export interface IFlagContext {
    [key: string]: string;
}
export interface IFlagResolver {
    getAll: (context?: IFlagContext) => IFlags;
    isEnabled: (expName: IFlagKey, context?: IFlagContext) => boolean;
    getVariant: (expName: IFlagKey, context?: IFlagContext) => Variant;
}
export interface IExternalFlagResolver {
    isEnabled: (flagName: IFlagKey, context?: IFlagContext) => boolean;
    getVariant: (flagName: IFlagKey, context?: IFlagContext) => Variant;
}
//# sourceMappingURL=experimental.d.ts.map