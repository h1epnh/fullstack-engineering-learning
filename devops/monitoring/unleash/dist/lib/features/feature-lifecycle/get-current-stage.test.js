"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const get_current_stage_1 = require("./get-current-stage");
const irrelevantDate = new Date('2024-04-22T10:00:00Z');
describe('getCurrentStage', () => {
    it('should return the first matching stage based on the preferred order', () => {
        const stages = [
            {
                stage: 'initial',
                enteredStageAt: irrelevantDate,
            },
            {
                stage: 'completed',
                status: 'kept',
                enteredStageAt: irrelevantDate,
            },
            {
                stage: 'archived',
                enteredStageAt: irrelevantDate,
            },
            { stage: 'live', enteredStageAt: irrelevantDate },
        ];
        const result = (0, get_current_stage_1.getCurrentStage)(stages);
        expect(result).toEqual({
            stage: 'archived',
            enteredStageAt: irrelevantDate,
        });
    });
    it('should handle an empty stages array', () => {
        const stages = [];
        const result = (0, get_current_stage_1.getCurrentStage)(stages);
        expect(result).toBeUndefined();
    });
});
//# sourceMappingURL=get-current-stage.test.js.map