"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingService = void 0;
const metric_events_1 = require("../../metric-events");
const date_fns_1 = require("date-fns");
const START_ONBOARDING_TRACKING_DATE = new Date(2024, 8, 3);
class OnboardingService {
    constructor({ onboardingStore, projectReadModel, userStore, }, { flagResolver, eventBus, getLogger, }) {
        this.onboardingStore = onboardingStore;
        this.projectReadModel = projectReadModel;
        this.userStore = userStore;
        this.flagResolver = flagResolver;
        this.eventBus = eventBus;
        this.logger = getLogger('onboarding/onboarding-service.ts');
    }
    listen() {
        this.eventBus.on(metric_events_1.USER_LOGIN, async (event) => {
            if (event.loginOrder === 0) {
                await this.insert({ type: 'first-user-login' });
            }
            if (event.loginOrder === 1) {
                await this.insert({
                    type: 'second-user-login',
                });
            }
        });
        this.eventBus.on(metric_events_1.STAGE_ENTERED, async (stage) => {
            if (stage.stage === 'initial') {
                await this.insert({
                    type: 'flag-created',
                    flag: stage.feature,
                });
            }
            else if (stage.stage === 'pre-live') {
                await this.insert({
                    type: 'pre-live',
                    flag: stage.feature,
                });
            }
            else if (stage.stage === 'live') {
                await this.insert({
                    type: 'live',
                    flag: stage.feature,
                });
            }
        });
    }
    async insert(event) {
        const firstInstanceUserDate = await this.userStore.getFirstUserDate();
        // the time we introduced onboarding tracking
        if (firstInstanceUserDate &&
            (0, date_fns_1.isBefore)(firstInstanceUserDate, START_ONBOARDING_TRACKING_DATE))
            return;
        await this.insertInstanceEvent(event, firstInstanceUserDate);
        if ('flag' in event) {
            await this.insertProjectEvent(event, firstInstanceUserDate);
        }
        this.eventBus.emit('onboarding-event');
    }
    async insertInstanceEvent(event, firstInstanceUserDate) {
        if (!firstInstanceUserDate)
            return;
        const timeToEvent = (0, date_fns_1.millisecondsToSeconds)(new Date().getTime() - firstInstanceUserDate.getTime());
        await this.onboardingStore.insertInstanceEvent({
            type: event.type,
            timeToEvent,
        });
    }
    async insertProjectEvent(event, firstInstanceUserDate) {
        const project = await this.projectReadModel.getFeatureProject(event.flag);
        if (!project)
            return;
        const startDate = project.project === 'default'
            ? firstInstanceUserDate
            : project.createdAt || null;
        if (!startDate)
            return;
        const timeToEvent = (0, date_fns_1.millisecondsToSeconds)(Date.now() - startDate.getTime());
        await this.onboardingStore.insertProjectEvent({
            type: event.type,
            timeToEvent,
            project: project.project,
        });
    }
}
exports.OnboardingService = OnboardingService;
//# sourceMappingURL=onboarding-service.js.map