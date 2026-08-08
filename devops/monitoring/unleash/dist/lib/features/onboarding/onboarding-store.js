"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingStore = void 0;
const projectEventLookup = {
    'flag-created': 'first-flag',
    'pre-live': 'first-pre-live',
    live: 'first-live',
};
const instanceEventLookup = {
    'flag-created': 'first-flag',
    'pre-live': 'first-pre-live',
    live: 'first-live',
    'first-user-login': 'first-user-login',
    'second-user-login': 'second-user-login',
};
class OnboardingStore {
    constructor(db) {
        this.db = db;
    }
    async insertInstanceEvent(event) {
        await this.db('onboarding_events_instance')
            .insert({
            event: instanceEventLookup[event.type],
            time_to_event: event.timeToEvent,
        })
            .onConflict()
            .ignore();
    }
    async insertProjectEvent(event) {
        await this.db('onboarding_events_project')
            .insert({
            event: projectEventLookup[event.type],
            time_to_event: event.timeToEvent,
            project: event.project,
        })
            .onConflict()
            .ignore();
    }
    async deleteAll() {
        await Promise.all([
            this.db('onboarding_events_project').del(),
            this.db('onboarding_events_instance').del(),
        ]);
    }
}
exports.OnboardingStore = OnboardingStore;
//# sourceMappingURL=onboarding-store.js.map