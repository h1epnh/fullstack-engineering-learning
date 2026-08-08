"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentStage = getCurrentStage;
const preferredOrder = [
    'archived',
    'completed',
    'live',
    'pre-live',
    'initial',
];
function getCurrentStage(stages) {
    for (const preferredStage of preferredOrder) {
        const foundStage = stages.find((stage) => stage.stage === preferredStage);
        if (foundStage) {
            return foundStage;
        }
    }
    return undefined;
}
//# sourceMappingURL=get-current-stage.js.map