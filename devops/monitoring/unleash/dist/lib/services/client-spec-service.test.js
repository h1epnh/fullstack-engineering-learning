"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_spec_service_1 = require("./client-spec-service");
const no_logger_1 = __importDefault(require("../../test/fixtures/no-logger"));
test('ClientSpecService validation', async () => {
    const service = new client_spec_service_1.ClientSpecService({ getLogger: no_logger_1.default });
    const fn = service.versionSupportsSpec.bind(service);
    expect(fn('segments', undefined)).toEqual(false);
    expect(fn('segments', '')).toEqual(false);
    expect(() => fn('segments', 'a')).toThrow('Invalid prefix');
    expect(() => fn('segments', '1.2')).toThrow('Invalid SemVer');
    expect(() => fn('segments', 'v1.2.3')).toThrow('Invalid prefix');
    expect(() => fn('segments', '=1.2.3')).toThrow('Invalid prefix');
    expect(() => fn('segments', '1.2.3.4')).toThrow('Invalid SemVer');
});
test('ClientSpecService segments', async () => {
    const service = new client_spec_service_1.ClientSpecService({ getLogger: no_logger_1.default });
    const fn = service.versionSupportsSpec.bind(service);
    expect(fn('segments', '0.0.0')).toEqual(false);
    expect(fn('segments', '1.0.0')).toEqual(false);
    expect(fn('segments', '4.1.9')).toEqual(false);
    expect(fn('segments', '4.2.0')).toEqual(true);
    expect(fn('segments', '4.2.1')).toEqual(true);
    expect(fn('segments', '5.0.0')).toEqual(true);
});
//# sourceMappingURL=client-spec-service.test.js.map