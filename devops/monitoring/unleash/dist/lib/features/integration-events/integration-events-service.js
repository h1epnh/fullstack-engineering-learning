"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationEventsService = void 0;
class IntegrationEventsService {
    constructor({ integrationEventsStore, }, { getLogger, flagResolver, }) {
        this.integrationEventsStore = integrationEventsStore;
        this.flagResolver = flagResolver;
        this.logger = getLogger('integration-events-service');
    }
    async getPaginatedEvents(id, limit, offset) {
        return this.integrationEventsStore.getPaginatedEvents(id, limit, offset);
    }
    async registerEvent(integrationEvent) {
        return this.integrationEventsStore.insert(integrationEvent);
    }
    async cleanUpEvents() {
        await this.integrationEventsStore.cleanUpEvents();
    }
}
exports.IntegrationEventsService = IntegrationEventsService;
//# sourceMappingURL=integration-events-service.js.map