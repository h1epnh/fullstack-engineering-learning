"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_impl_1 = require("./lib/server-impl");
const create_config_1 = require("./lib/create-config");
const logger_1 = require("./lib/logger");
const api_token_1 = require("./lib/types/models/api-token");
process.nextTick(async () => {
    try {
        await (0, server_impl_1.start)((0, create_config_1.createConfig)({
            db: process.env.DATABASE_URL
                ? undefined
                : {
                    user: 'unleash_user',
                    password: 'password',
                    host: 'localhost',
                    port: 5432,
                    database: process.env.UNLEASH_DATABASE_NAME || 'unleash',
                    schema: process.env.UNLEASH_DATABASE_SCHEMA,
                    ssl: false,
                    applicationName: 'unleash',
                },
            server: {
                enableRequestLogger: true,
                baseUriPath: '',
                // keepAliveTimeout: 1,
                gracefulShutdownEnable: true,
                // cdnPrefix: 'https://cdn.getunleash.io/unleash/v4.4.1',
                enableHeapSnapshotEnpoint: true,
            },
            logLevel: logger_1.LogLevel.debug,
            secureHeaders: false,
            versionCheck: {
                enable: false,
            },
            experimental: {
                // externalResolver: unleash,
                flags: {
                    embedProxy: true,
                    embedProxyFrontend: true,
                    anonymiseEventLog: false,
                    responseTimeWithAppNameKillSwitch: false,
                    userAccessUIEnabled: true,
                    outdatedSdksBanner: true,
                    disableShowContextFieldSelectionValues: false,
                    feedbackPosting: true,
                    manyStrategiesPagination: true,
                    enableLegacyVariants: false,
                    extendedMetrics: true,
                    originMiddlewareRequestLogging: true,
                    webhookDomainLogging: true,
                    releasePlans: false,
                    showUserDeviceCount: true,
                    flagOverviewRedesign: true,
                    deltaApi: true,
                    uniqueSdkTracking: true,
                    filterExistingFlagNames: true,
                    teamsIntegrationChangeRequests: true,
                    simplifyDisableFeature: true,
                    adminNavUI: false,
                    tagTypeColor: true,
                },
            },
            authentication: {
                initApiTokens: [
                    {
                        environment: '*',
                        project: '*',
                        secret: '*:*.964a287e1b728cb5f4f3e0120df92cb5',
                        type: api_token_1.ApiTokenType.ADMIN,
                        tokenName: 'some-user',
                    },
                ],
            },
            /* can be tweaked to control configuration caching for /api/client/features
            clientFeatureCaching: {
                enabled: true,
                maxAge: 4000,
            },
            */
        }));
    }
    catch (error) {
        if (error.code === 'EADDRINUSE') {
            // eslint-disable-next-line no-console
            console.warn('Port in use. You might want to reload once more.');
        }
        else {
            // eslint-disable-next-line no-console
            console.error(error);
            process.exit();
        }
    }
}, 0);
//# sourceMappingURL=server-dev.js.map