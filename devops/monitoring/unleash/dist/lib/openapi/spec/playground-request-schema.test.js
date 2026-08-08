"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const fast_check_1 = __importDefault(require("fast-check"));
const arbitraries_test_1 = require("../../../test/arbitraries.test");
const playground_request_schema_1 = require("../../../lib/openapi/spec/playground-request-schema");
const validate_1 = require("../validate");
const sdk_context_schema_test_1 = require("./sdk-context-schema.test");
const generate = () => fast_check_1.default.record({
    environment: fast_check_1.default.oneof(fast_check_1.default.constantFrom('development', 'production', 'default'), fast_check_1.default.lorem({ maxCount: 1 })),
    projects: fast_check_1.default.oneof(fast_check_1.default.uniqueArray(fast_check_1.default.oneof(fast_check_1.default.lorem({ maxCount: 1 }), (0, arbitraries_test_1.urlFriendlyString)())), fast_check_1.default.constant('*')),
    context: (0, sdk_context_schema_test_1.generate)(),
});
exports.generate = generate;
test('playgroundRequestSchema', () => fast_check_1.default.assert(fast_check_1.default.property((0, exports.generate)(), (data) => (0, validate_1.validateSchema)(playground_request_schema_1.playgroundRequestSchema.$id, data) === undefined)));
//# sourceMappingURL=playground-request-schema.test.js.map