import type EventEmitter from 'events';
declare const REQUEST_TIME = "request_time";
declare const SDK_CONNECTION_ID_RECEIVED = "sdk_connection_id_received";
declare const DB_TIME = "db_time";
declare const FUNCTION_TIME = "function_time";
declare const SCHEDULER_JOB_TIME = "scheduler_job_time";
declare const FEATURES_CREATED_BY_PROCESSED = "features_created_by_processed";
declare const EVENTS_CREATED_BY_PROCESSED = "events_created_by_processed";
declare const FRONTEND_API_REPOSITORY_CREATED = "frontend_api_repository_created";
declare const PROXY_REPOSITORY_CREATED = "proxy_repository_created";
declare const PROXY_FEATURES_FOR_TOKEN_TIME = "proxy_features_for_token_time";
declare const STAGE_ENTERED: "stage-entered";
declare const USER_LOGIN: "user-login";
declare const EXCEEDS_LIMIT: "exceeds-limit";
declare const REQUEST_ORIGIN: "request_origin";
declare const ADDON_EVENTS_HANDLED: "addon-event-handled";
declare const CLIENT_METRICS_NAMEPREFIX = "client-api-nameprefix";
declare const CLIENT_METRICS_TAGS = "client-api-tags";
declare const CLIENT_FEATURES_MEMORY = "client_features_memory";
declare const CLIENT_DELTA_MEMORY = "client_delta_memory";
declare const CLIENT_REGISTERED = "client_registered";
type MetricEvent = typeof REQUEST_TIME | typeof SDK_CONNECTION_ID_RECEIVED | typeof DB_TIME | typeof FUNCTION_TIME | typeof SCHEDULER_JOB_TIME | typeof FEATURES_CREATED_BY_PROCESSED | typeof EVENTS_CREATED_BY_PROCESSED | typeof FRONTEND_API_REPOSITORY_CREATED | typeof PROXY_REPOSITORY_CREATED | typeof PROXY_FEATURES_FOR_TOKEN_TIME | typeof STAGE_ENTERED | typeof USER_LOGIN | typeof EXCEEDS_LIMIT | typeof REQUEST_ORIGIN | typeof CLIENT_METRICS_NAMEPREFIX | typeof CLIENT_METRICS_TAGS | typeof CLIENT_FEATURES_MEMORY | typeof CLIENT_DELTA_MEMORY;
type RequestOriginEventPayload = {
    type: 'UI' | 'API';
    method: Request['method'];
    source?: string;
};
type MetricEventPayloads = {
    [key: string]: unknown;
    [REQUEST_ORIGIN]: RequestOriginEventPayload;
};
type MetricEventPayload<T extends MetricEvent> = MetricEventPayloads[T];
type MetricEventListener<T extends MetricEvent> = (payload: MetricEventPayload<T>) => void;
declare const emitMetricEvent: <T extends MetricEvent>(eventBus: EventEmitter, event: T, payload: MetricEventPayload<T>) => boolean;
declare const onMetricEvent: <T extends MetricEvent>(eventBus: EventEmitter, event: T, listener: MetricEventListener<T>) => void;
export { REQUEST_TIME, SDK_CONNECTION_ID_RECEIVED, DB_TIME, SCHEDULER_JOB_TIME, FUNCTION_TIME, FEATURES_CREATED_BY_PROCESSED, EVENTS_CREATED_BY_PROCESSED, FRONTEND_API_REPOSITORY_CREATED, PROXY_REPOSITORY_CREATED, PROXY_FEATURES_FOR_TOKEN_TIME, STAGE_ENTERED, USER_LOGIN, EXCEEDS_LIMIT, REQUEST_ORIGIN, ADDON_EVENTS_HANDLED, CLIENT_METRICS_NAMEPREFIX, CLIENT_METRICS_TAGS, CLIENT_FEATURES_MEMORY, CLIENT_DELTA_MEMORY, CLIENT_REGISTERED, type MetricEvent, type MetricEventPayload, emitMetricEvent, onMetricEvent, };
//# sourceMappingURL=metric-events.d.ts.map