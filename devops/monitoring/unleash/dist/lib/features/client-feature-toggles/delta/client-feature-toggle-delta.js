"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientFeatureToggleDelta = exports.filterHydrationEventByQuery = exports.filterEventsByQuery = exports.UPDATE_DELTA = void 0;
const types_1 = require("../../../types");
const configuration_revision_service_1 = require("../../feature-toggle/configuration-revision-service");
const delta_cache_1 = require("./delta-cache");
const metric_events_1 = require("../../../metric-events");
const events_1 = __importDefault(require("events"));
const client_feature_toggle_delta_types_1 = require("./client-feature-toggle-delta-types");
exports.UPDATE_DELTA = 'UPDATE_DELTA';
const filterEventsByQuery = (events, requiredRevisionId, projects, namePrefix) => {
    const targetedEvents = events.filter((revision) => revision.eventId > requiredRevisionId);
    const allProjects = projects.includes('*');
    const startsWithPrefix = (revision) => {
        return (((0, client_feature_toggle_delta_types_1.isDeltaFeatureUpdatedEvent)(revision) &&
            revision.feature.name.startsWith(namePrefix)) ||
            ((0, client_feature_toggle_delta_types_1.isDeltaFeatureRemovedEvent)(revision) &&
                revision.featureName.startsWith(namePrefix)));
    };
    const isInProject = (revision) => {
        return (((0, client_feature_toggle_delta_types_1.isDeltaFeatureUpdatedEvent)(revision) &&
            projects.includes(revision.feature.project)) ||
            ((0, client_feature_toggle_delta_types_1.isDeltaFeatureRemovedEvent)(revision) &&
                projects.includes(revision.project)));
    };
    return targetedEvents.filter((revision) => {
        return ((0, client_feature_toggle_delta_types_1.isDeltaSegmentEvent)(revision) ||
            (startsWithPrefix(revision) &&
                (allProjects || isInProject(revision))));
    });
};
exports.filterEventsByQuery = filterEventsByQuery;
const filterHydrationEventByQuery = (event, projects, namePrefix) => {
    const allProjects = projects.includes('*');
    const { type, features, eventId, segments } = event;
    return {
        eventId,
        type,
        segments,
        features: features.filter((feature) => {
            return (feature.name.startsWith(namePrefix) &&
                (allProjects || projects.includes(feature.project)));
        }),
    };
};
exports.filterHydrationEventByQuery = filterHydrationEventByQuery;
class ClientFeatureToggleDelta extends events_1.default {
    constructor(clientFeatureToggleDeltaReadModel, segmentReadModel, eventStore, configurationRevisionService, flagResolver, config) {
        super();
        this.delta = {};
        this.currentRevisionId = 0;
        this.eventStore = eventStore;
        this.configurationRevisionService = configurationRevisionService;
        this.clientFeatureToggleDeltaReadModel =
            clientFeatureToggleDeltaReadModel;
        this.flagResolver = flagResolver;
        this.segmentReadModel = segmentReadModel;
        this.eventBus = config.eventBus;
        this.logger = config.getLogger('delta/client-feature-toggle-delta.js');
        this.onUpdateRevisionEvent = this.onUpdateRevisionEvent.bind(this);
        this.delta = {};
        this.configurationRevisionService.on(configuration_revision_service_1.UPDATE_REVISION, this.onUpdateRevisionEvent);
    }
    static getInstance(clientFeatureToggleDeltaReadModel, segmentReadModel, eventStore, configurationRevisionService, flagResolver, config) {
        if (!ClientFeatureToggleDelta.instance) {
            ClientFeatureToggleDelta.instance = new ClientFeatureToggleDelta(clientFeatureToggleDeltaReadModel, segmentReadModel, eventStore, configurationRevisionService, flagResolver, config);
        }
        return ClientFeatureToggleDelta.instance;
    }
    async getDelta(sdkRevisionId, query) {
        const projects = query.project ? query.project : ['*'];
        const environment = query.environment ? query.environment : 'default';
        const namePrefix = query.namePrefix ? query.namePrefix : '';
        const requiredRevisionId = sdkRevisionId || 0;
        const hasDelta = this.delta[environment] !== undefined;
        if (!hasDelta) {
            await this.initEnvironmentDelta(environment);
        }
        if (requiredRevisionId >= this.currentRevisionId) {
            return undefined;
        }
        const delta = this.delta[environment];
        if (requiredRevisionId === 0 ||
            delta.isMissingRevision(requiredRevisionId)) {
            const hydrationEvent = delta.getHydrationEvent();
            const filteredEvent = (0, exports.filterHydrationEventByQuery)(hydrationEvent, projects, namePrefix);
            const response = {
                events: [filteredEvent],
            };
            return Promise.resolve(response);
        }
        else {
            const environmentEvents = delta.getEvents();
            const events = (0, exports.filterEventsByQuery)(environmentEvents, requiredRevisionId, projects, namePrefix);
            if (events.length === 0) {
                return undefined;
            }
            return {
                events,
            };
        }
    }
    async onUpdateRevisionEvent() {
        if (this.flagResolver.isEnabled('deltaApi')) {
            await this.updateFeaturesDelta();
            this.storeFootprint();
            this.emit(exports.UPDATE_DELTA);
        }
    }
    /**
     * This is used in client-feature-delta-api.e2e.test.ts, do not remove
     */
    resetDelta() {
        this.delta = {};
    }
    async updateFeaturesDelta() {
        const keys = Object.keys(this.delta);
        if (keys.length === 0)
            return;
        const latestRevision = await this.configurationRevisionService.getMaxRevisionId();
        const changeEvents = await this.eventStore.getRevisionRange(this.currentRevisionId, latestRevision);
        const featuresMovedEvents = changeEvents
            .filter((event) => event.featureName)
            .filter((event) => event.type === types_1.FEATURE_PROJECT_CHANGE)
            .map((event) => ({
            eventId: latestRevision,
            type: client_feature_toggle_delta_types_1.DELTA_EVENT_TYPES.FEATURE_REMOVED,
            featureName: event.featureName,
            project: event.data.oldProject,
        }));
        const featuresUpdated = [
            ...new Set(changeEvents
                .filter((event) => event.featureName)
                .filter((event) => event.type !== 'feature-archived')
                .filter((event) => event.type !== 'feature-deleted')
                .map((event) => event.featureName)),
        ];
        const featuresRemovedEvents = changeEvents
            .filter((event) => event.featureName && event.project)
            .filter((event) => event.type === 'feature-archived')
            .map((event) => ({
            eventId: latestRevision,
            type: client_feature_toggle_delta_types_1.DELTA_EVENT_TYPES.FEATURE_REMOVED,
            featureName: event.featureName,
            project: event.project,
        }));
        const segmentsUpdated = changeEvents
            .filter((event) => ['segment-created', 'segment-updated'].includes(event.type))
            .map((event) => event.data.id);
        const segmentsRemoved = changeEvents
            .filter((event) => event.type === 'segment-deleted')
            .map((event) => event.preData.id);
        const segments = await this.segmentReadModel.getAllForClientIds(segmentsUpdated);
        const segmentsUpdatedEvents = segments.map((segment) => ({
            eventId: latestRevision,
            type: client_feature_toggle_delta_types_1.DELTA_EVENT_TYPES.SEGMENT_UPDATED,
            segment,
        }));
        const segmentsRemovedEvents = segmentsRemoved.map((segmentId) => ({
            eventId: latestRevision,
            type: client_feature_toggle_delta_types_1.DELTA_EVENT_TYPES.SEGMENT_REMOVED,
            segmentId,
        }));
        // TODO: we might want to only update the environments that had events changed for performance
        for (const environment of keys) {
            const newToggles = await this.getChangedToggles(environment, featuresUpdated);
            const featuresUpdatedEvents = newToggles.map((toggle) => ({
                eventId: latestRevision,
                type: client_feature_toggle_delta_types_1.DELTA_EVENT_TYPES.FEATURE_UPDATED,
                feature: toggle,
            }));
            this.delta[environment].addEvents([
                ...featuresMovedEvents,
                ...featuresUpdatedEvents,
                ...featuresRemovedEvents,
                ...segmentsUpdatedEvents,
                ...segmentsRemovedEvents,
            ]);
        }
        this.currentRevisionId = latestRevision;
    }
    async getChangedToggles(environment, toggles) {
        if (toggles.length === 0) {
            return [];
        }
        return this.getClientFeatures({
            toggleNames: toggles,
            environment,
        });
    }
    async initEnvironmentDelta(environment) {
        const baseFeatures = await this.getClientFeatures({
            environment,
        });
        const baseSegments = await this.segmentReadModel.getAllForClientIds();
        this.currentRevisionId =
            await this.configurationRevisionService.getMaxRevisionId();
        this.delta[environment] = new delta_cache_1.DeltaCache({
            eventId: this.currentRevisionId,
            type: client_feature_toggle_delta_types_1.DELTA_EVENT_TYPES.HYDRATION,
            features: baseFeatures,
            segments: baseSegments,
        });
        this.storeFootprint();
    }
    async getClientFeatures(query) {
        const result = await this.clientFeatureToggleDeltaReadModel.getAll(query);
        return result;
    }
    storeFootprint() {
        try {
            const memory = this.getCacheSizeInBytes(this.delta);
            this.eventBus.emit(metric_events_1.CLIENT_DELTA_MEMORY, { memory });
        }
        catch (e) {
            this.logger.error('Client delta footprint error', e);
        }
    }
    getCacheSizeInBytes(value) {
        const jsonString = JSON.stringify(value);
        return Buffer.byteLength(jsonString, 'utf8');
    }
}
exports.ClientFeatureToggleDelta = ClientFeatureToggleDelta;
//# sourceMappingURL=client-feature-toggle-delta.js.map