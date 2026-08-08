"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../fixtures/no-logger"));
let stores;
let db;
let userFeedbackStore;
let userStore;
let currentUser;
beforeAll(async () => {
    db = await (0, database_init_1.default)('user_feedback_store', no_logger_1.default);
    stores = db.stores;
    userFeedbackStore = stores.userFeedbackStore;
    userStore = stores.userStore;
    currentUser = await userStore.upsert({ email: 'me.feedback@mail.com' });
});
afterAll(async () => {
    await db.destroy();
});
afterEach(async () => {
    await userFeedbackStore.deleteAll();
});
test('should create userFeedback', async () => {
    await userFeedbackStore.updateFeedback({
        feedbackId: 'some-id',
        userId: currentUser.id,
        neverShow: false,
        given: new Date(),
    });
    const userFeedbacks = await userFeedbackStore.getAllUserFeedback(currentUser.id);
    expect(userFeedbacks).toHaveLength(1);
    expect(userFeedbacks[0].feedbackId).toBe('some-id');
});
test('should get userFeedback', async () => {
    await userFeedbackStore.updateFeedback({
        feedbackId: 'some-id',
        userId: currentUser.id,
        neverShow: false,
        given: new Date(),
    });
    const userFeedback = await userFeedbackStore.getFeedback(currentUser.id, 'some-id');
    expect(userFeedback.feedbackId).toBe('some-id');
});
test('should exists', async () => {
    await userFeedbackStore.updateFeedback({
        feedbackId: 'some-id-3',
        userId: currentUser.id,
        neverShow: false,
        given: new Date(),
    });
    const exists = await userFeedbackStore.exists({
        userId: currentUser.id,
        feedbackId: 'some-id-3',
    });
    expect(exists).toBe(true);
});
test('should not exists', async () => {
    const exists = await userFeedbackStore.exists({
        userId: currentUser.id,
        feedbackId: 'some-id-not-here',
    });
    expect(exists).toBe(false);
});
test('should get all userFeedbacks', async () => {
    await userFeedbackStore.updateFeedback({
        feedbackId: 'some-id-2',
        userId: currentUser.id,
        neverShow: false,
        given: new Date(),
    });
    const userFeedbacks = await userFeedbackStore.getAll();
    expect(userFeedbacks).toHaveLength(1);
    expect(userFeedbacks[0].feedbackId).toBe('some-id-2');
});
//# sourceMappingURL=user-feedback-store.e2e.test.js.map