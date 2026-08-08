"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMedians = void 0;
exports.calculateStageDurations = calculateStageDurations;
const date_fns_1 = require("date-fns");
const median_1 = require("../../util/median");
function calculateStageDurations(featureLifeCycles) {
    const sortedLifeCycles = featureLifeCycles.sort((a, b) => a.enteredStageAt.getTime() - b.enteredStageAt.getTime());
    const groupedByProjectAndStage = sortedLifeCycles.reduce((acc, curr, index, array) => {
        const key = `${curr.project}/${curr.stage}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        const nextItem = array
            .slice(index + 1)
            .find((item) => item.feature === curr.feature && item.stage !== curr.stage);
        const endTime = nextItem ? nextItem.enteredStageAt : new Date();
        const duration = (0, date_fns_1.differenceInMinutes)(endTime, curr.enteredStageAt);
        acc[key].push(duration);
        return acc;
    }, {});
    return (0, exports.calculateMedians)(groupedByProjectAndStage);
}
const calculateMedians = (groupedByProjectAndStage) => {
    const medians = [];
    Object.entries(groupedByProjectAndStage).forEach(([key, durations]) => {
        const [project, stage] = key.split('/');
        const duration = (0, median_1.median)(durations);
        medians.push({
            project,
            stage: stage,
            duration,
        });
    });
    return medians;
};
exports.calculateMedians = calculateMedians;
//# sourceMappingURL=calculate-stage-durations.js.map