"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterAccessibleProjects = void 0;
const api_token_1 = require("../../types/models/api-token");
const metric_events_1 = require("../../metric-events");
const search_utils_1 = require("../feature-search/search-utils");
const date_fns_1 = require("date-fns");
const lodash_1 = require("lodash");
class EventService {
    constructor({ eventStore, featureTagStore, }, { getLogger, eventBus, isEnterprise, }, privateProjectChecker, accessReadModel) {
        this.convertToDbParams = (params) => {
            const queryParams = [];
            if (params.from) {
                const parsed = (0, search_utils_1.parseSearchOperatorValue)('created_at', params.from);
                if (parsed) {
                    queryParams.push({
                        field: parsed.field,
                        operator: 'IS_ON_OR_AFTER',
                        values: parsed.values,
                    });
                }
            }
            if (params.to) {
                const parsed = (0, search_utils_1.parseSearchOperatorValue)('created_at', params.to);
                if (parsed) {
                    const values = parsed.values
                        .filter((v) => v !== null)
                        .map((date) => (0, date_fns_1.formatISO)((0, date_fns_1.addDays)(new Date(date), 1), {
                        representation: 'date',
                    }));
                    queryParams.push({
                        field: parsed.field,
                        operator: 'IS_BEFORE',
                        values,
                    });
                }
            }
            if (params.createdBy) {
                const parsed = (0, search_utils_1.parseSearchOperatorValue)('created_by_user_id', params.createdBy);
                if (parsed)
                    queryParams.push(parsed);
            }
            if (params.feature) {
                const parsed = (0, search_utils_1.parseSearchOperatorValue)('feature_name', params.feature);
                if (parsed)
                    queryParams.push(parsed);
            }
            ['project', 'type'].forEach((field) => {
                if (params[field]) {
                    const parsed = (0, search_utils_1.parseSearchOperatorValue)(field, params[field]);
                    if (parsed)
                        queryParams.push(parsed);
                }
            });
            return queryParams;
        };
        this.logger = getLogger('services/event-service.ts');
        this.eventStore = eventStore;
        this.privateProjectChecker = privateProjectChecker;
        this.featureTagStore = featureTagStore;
        this.eventBus = eventBus;
        this.isEnterprise = isEnterprise;
        this.accessReadModel = accessReadModel;
    }
    async getEvents() {
        const totalEvents = await this.eventStore.count();
        const events = await this.eventStore.getEvents();
        return {
            events,
            totalEvents,
        };
    }
    async deprecatedSearchEvents(search) {
        const totalEvents = await this.eventStore.deprecatedFilteredCount(search);
        const events = await this.eventStore.deprecatedSearchEvents(search);
        return {
            events,
            totalEvents,
        };
    }
    async searchEvents(search, userId) {
        const projectAccess = await this.privateProjectChecker.getUserAccessibleProjects(userId);
        search.project = (0, exports.filterAccessibleProjects)(search.project, projectAccess);
        const queryParams = this.convertToDbParams(search);
        const projectFilter = await this.getProjectFilterForNonAdmins(userId);
        queryParams.push(...projectFilter);
        const totalEvents = await this.eventStore.searchEventsCount({
            limit: search.limit,
            offset: search.offset,
            query: search.query,
        }, queryParams);
        const events = await this.eventStore.searchEvents({
            limit: search.limit,
            offset: search.offset,
            query: search.query,
        }, queryParams, {
            withIp: this.isEnterprise,
        });
        return {
            events,
            totalEvents,
        };
    }
    async onEvent(eventName, listener) {
        return this.eventStore.on(eventName, listener);
    }
    async enhanceEventsWithTags(events) {
        const featureNamesSet = new Set();
        for (const event of events) {
            if (event.featureName && !event.tags) {
                featureNamesSet.add(event.featureName);
            }
        }
        const featureTagsMap = new Map();
        const allTagsInFeatures = await this.featureTagStore.getAllByFeatures(Array.from(featureNamesSet));
        for (const tag of allTagsInFeatures) {
            const featureTags = featureTagsMap.get(tag.featureName) || [];
            featureTags.push({ value: tag.tagValue, type: tag.tagType });
            featureTagsMap.set(tag.featureName, featureTags);
        }
        for (const event of events) {
            if (event.featureName && !event.tags) {
                event.tags = featureTagsMap.get(event.featureName);
            }
        }
        return events;
    }
    isAdminToken(user) {
        return user?.type === api_token_1.ApiTokenType.ADMIN;
    }
    async storeEvent(event) {
        return this.storeEvents([event]);
    }
    async storeEvents(events) {
        // if the event comes with both preData and data, we need to check if they are different before storing, otherwise we discard the event
        let enhancedEvents = events.filter((event) => !event.preData ||
            !event.data ||
            !(0, lodash_1.isEqual)(event.preData, event.data));
        if (enhancedEvents.length === 0) {
            return;
        }
        for (const enhancer of [this.enhanceEventsWithTags.bind(this)]) {
            enhancedEvents = await enhancer(enhancedEvents);
        }
        return this.eventStore.batchStore(enhancedEvents);
    }
    async setEventCreatedByUserId() {
        const updated = await this.eventStore.setCreatedByUserId(100);
        if (updated !== undefined) {
            this.eventBus.emit(metric_events_1.EVENTS_CREATED_BY_PROCESSED, {
                updated,
            });
        }
    }
    async getEventCreators() {
        return this.eventStore.getEventCreators();
    }
    async getProjectFilterForNonAdmins(userId) {
        const isRootAdmin = await this.accessReadModel.isRootAdmin(userId);
        if (!isRootAdmin) {
            return [{ field: 'project', operator: 'IS_NOT', values: [null] }];
        }
        return [];
    }
}
exports.default = EventService;
const filterAccessibleProjects = (projectParam, projectAccess) => {
    if (projectAccess.mode !== 'all') {
        const allowedProjects = projectAccess.projects;
        if (!projectParam) {
            return `IS_ANY_OF:${allowedProjects.join(',')}`;
        }
        else {
            const searchProjectList = projectParam.split(',');
            const filteredProjects = searchProjectList
                .filter((proj) => allowedProjects.includes(proj.replace(/^(IS|IS_ANY_OF):/, '')))
                .join(',');
            if (!filteredProjects) {
                throw new Error('No accessible projects in the search parameters');
            }
            return filteredProjects;
        }
    }
    return projectParam;
};
exports.filterAccessibleProjects = filterAccessibleProjects;
//# sourceMappingURL=event-service.js.map