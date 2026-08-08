"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const fast_check_1 = __importDefault(require("fast-check"));
const validate_1 = require("../validate");
const sdk_context_schema_1 = require("./sdk-context-schema");
const arbitraries_test_1 = require("../../../test/arbitraries.test");
const generate = () => fast_check_1.default.record({
    appName: fast_check_1.default.string({ minLength: 1 }),
    currentTime: (0, arbitraries_test_1.commonISOTimestamp)(),
    environment: fast_check_1.default.string(),
    properties: fast_check_1.default.dictionary(fast_check_1.default.string(), fast_check_1.default.string()),
    remoteAddress: fast_check_1.default.ipV4(),
    sessionId: fast_check_1.default.uuid(),
    userId: fast_check_1.default.emailAddress(),
}, { requiredKeys: ['appName'] });
exports.generate = generate;
test('sdkContextSchema', () => fast_check_1.default.assert(fast_check_1.default.property((0, exports.generate)(), (data) => (0, validate_1.validateSchema)(sdk_context_schema_1.sdkContextSchema.$id, data) === undefined)));
//# sourceMappingURL=sdk-context-schema.test.js.map