"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventAnnouncer {
    constructor({ eventStore }, { getLogger, flagResolver, }) {
        this.logger = getLogger('services/event-service.ts');
        this.flagResolver = flagResolver;
        this.eventStore = eventStore;
    }
    async publishUnannouncedEvents() {
        if (this.flagResolver.isEnabled('disablePublishUnannouncedEvents')) {
            return Promise.resolve();
        }
        else {
            return this.eventStore.publishUnannouncedEvents();
        }
    }
}
exports.default = EventAnnouncer;
//# sourceMappingURL=event-announcer-service.js.map