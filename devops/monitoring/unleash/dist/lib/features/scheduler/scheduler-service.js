"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const metric_events_1 = require("../../metric-events");
// returns between min and max seconds in ms
// when schedule interval is smaller than max jitter then no jitter
function randomJitter(minMs, maxMs, scheduleIntervalMs) {
    if (scheduleIntervalMs < maxMs) {
        return 0;
    }
    return Math.random() * (maxMs - minMs) + minMs;
}
class SchedulerService {
    constructor(getLogger, maintenanceStatus, eventBus) {
        this.intervalIds = [];
        this.executingSchedulers = new Set();
        this.logger = getLogger('/services/scheduler-service.ts');
        this.maintenanceStatus = maintenanceStatus;
        this.eventBus = eventBus;
    }
    async schedule(scheduledFunction, timeMs, id, jitter = randomJitter(2 * 1000, 30 * 1000, timeMs)) {
        const runScheduledFunctionWithEvent = async () => {
            if (this.executingSchedulers.has(id)) {
                // If the job is already executing, don't start another
                return;
            }
            try {
                this.executingSchedulers.add(id);
                const startTime = process.hrtime();
                await scheduledFunction();
                const endTime = process.hrtime(startTime);
                // Process hrtime returns a list with two numbers representing high-resolution time.
                // The first number is the number of seconds, the second is the number of nanoseconds.
                // Since there are 1e9 (1,000,000,000) nanoseconds in a second, endTime[1] / 1e9 converts the nanoseconds to seconds.
                const durationInSeconds = endTime[0] + endTime[1] / 1e9;
                this.eventBus.emit(metric_events_1.SCHEDULER_JOB_TIME, {
                    jobId: id,
                    time: durationInSeconds,
                });
            }
            finally {
                this.executingSchedulers.delete(id);
            }
        };
        // scheduled run
        this.intervalIds.push(setInterval(async () => {
            try {
                const maintenanceMode = await this.maintenanceStatus.isMaintenanceMode();
                if (!maintenanceMode) {
                    await runScheduledFunctionWithEvent();
                }
            }
            catch (e) {
                this.logger.error(`interval scheduled job failed | id: ${id}`, e);
            }
        }, timeMs).unref());
        // initial run with jitter
        try {
            const maintenanceMode = await this.maintenanceStatus.isMaintenanceMode();
            if (!maintenanceMode) {
                if (jitter) {
                    const id = setTimeout(() => runScheduledFunctionWithEvent(), jitter);
                    this.intervalIds.push(id);
                }
                else {
                    await runScheduledFunctionWithEvent();
                }
            }
        }
        catch (e) {
            this.logger.error(`initial scheduled job failed | id: ${id}`, e);
        }
    }
    stop() {
        this.intervalIds.forEach(clearInterval);
        this.executingSchedulers.clear();
    }
}
exports.SchedulerService = SchedulerService;
//# sourceMappingURL=scheduler-service.js.map