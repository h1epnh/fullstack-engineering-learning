import type { IUserFeedback, IUserFeedbackKey, IUserFeedbackStore } from '../../lib/types/stores/user-feedback-store';
export default class FakeUserFeedbackStore implements IUserFeedbackStore {
    delete(key: IUserFeedbackKey): Promise<void>;
    deleteAll(): Promise<void>;
    destroy(): void;
    exists(key: IUserFeedbackKey): Promise<boolean>;
    get(key: IUserFeedbackKey): Promise<IUserFeedback>;
    getAll(): Promise<IUserFeedback[]>;
    getAllUserFeedback(userId: number): Promise<IUserFeedback[]>;
    getFeedback(userId: number, feedbackId: string): Promise<IUserFeedback>;
    updateFeedback(feedback: IUserFeedback): Promise<IUserFeedback>;
}
//# sourceMappingURL=fake-user-feedback-store.d.ts.map