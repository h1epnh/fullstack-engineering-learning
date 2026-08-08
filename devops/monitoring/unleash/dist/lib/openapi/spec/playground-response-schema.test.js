"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fast_check_1 = __importDefault(require("fast-check"));
const playground_response_schema_1 = require("../../../lib/openapi/spec/playground-response-schema");
const validate_1 = require("../validate");
const playground_request_schema_test_1 = require("./playground-request-schema.test");
const playground_feature_schema_test_1 = require("./playground-feature-schema.test");
const generate = () => fast_check_1.default.record({
    input: (0, playground_request_schema_test_1.generate)(),
    features: fast_check_1.default.uniqueArray((0, playground_feature_schema_test_1.generate)(), {
        selector: (feature) => feature.name,
    }),
});
test('playgroundResponseSchema', () => fast_check_1.default.assert(fast_check_1.default.property(generate(), (data) => (0, validate_1.validateSchema)(playground_response_schema_1.playgroundResponseSchema.$id, data) ===
    undefined)));
//# sourceMappingURL=playground-response-schema.test.js.map