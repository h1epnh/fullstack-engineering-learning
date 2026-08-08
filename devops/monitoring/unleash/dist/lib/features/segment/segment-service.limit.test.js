"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const no_logger_1 = __importDefault(require("../../../test/fixtures/no-logger"));
const createSegmentService_1 = require("./createSegmentService");
const alwaysOnFlagResolver = {
    isEnabled() {
        return true;
    },
};
test('Should not allow to exceed segment limit', async () => {
    const LIMIT = 1;
    const segmentService = (0, createSegmentService_1.createFakeSegmentService)({
        getLogger: no_logger_1.default,
        flagResolver: alwaysOnFlagResolver,
        resourceLimits: { segments: LIMIT },
        eventBus: {
            emit: () => { },
        },
    });
    const createSegment = (name) => segmentService.create({ name, constraints: [] }, {});
    await createSegment('segmentA');
    await expect(() => createSegment('segmentB')).rejects.toThrow("Failed to create segment. You can't create more than the established limit of 1.");
});
//# sourceMappingURL=segment-service.limit.test.js.map