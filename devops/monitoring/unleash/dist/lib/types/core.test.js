"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../../test/e2e/helpers/database-init"));
const core_1 = require("./core");
const no_logger_1 = __importDefault(require("../../test/fixtures/no-logger"));
describe('System user definitions in code and db', () => {
    let dbDefinition;
    let db;
    beforeAll(async () => {
        jest.setTimeout(15000);
        db = await (0, database_init_1.default)('system_user_alignment_test', no_logger_1.default);
        const query = await db.rawDatabase.raw(`select * from users where id = -1337;`);
        dbDefinition = query.rows[0];
    });
    afterAll(async () => {
        await db.destroy();
    });
    test('usernames match', () => {
        expect(core_1.SYSTEM_USER.username).toBe(dbDefinition.username);
    });
    test('ids match', () => {
        expect(core_1.SYSTEM_USER.id).toBe(dbDefinition.id);
    });
    test('names match', () => {
        expect(core_1.SYSTEM_USER.name).toBe(dbDefinition.name);
    });
    test('emails match', () => {
        expect('email' in core_1.SYSTEM_USER).toBe(false);
        expect(dbDefinition.email).toBe(null);
    });
    test('image URLs are both falsy', () => {
        expect(Boolean(core_1.SYSTEM_USER.imageUrl)).toBe(Boolean(dbDefinition.image_url));
    });
    test('isApi is false on variable definition', () => {
        // we don't set this in the DB, so let's just test the
        // definition
        expect(core_1.SYSTEM_USER.isAPI).toBe(false);
    });
});
//# sourceMappingURL=core.test.js.map