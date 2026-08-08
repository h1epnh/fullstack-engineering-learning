import type { IUnleashStores } from '../types/stores';
import type { IUnleashConfig } from '../types/option';
import type { IUser } from '../types/user';
import type { IUserFeedback } from '../types/stores/user-feedback-store';
export default class UserFeedbackService {
    private userFeedbackStore;
    private logger;
    constructor({ userFeedbackStore }: Pick<IUnleashStores, 'userFeedbackStore'>, { getLogger }: Pick<IUnleashConfig, 'getLogger'>);
    getAllUserFeedback(user: IUser): Promise<IUserFeedback[]>;
    getFeedback(user_id: number, feedback_id: string): Promise<IUserFeedback>;
    updateFeedback(feedback: IUserFeedback): Promise<IUserFeedback>;
}
//# sourceMappingURL=user-feedback-service.d.ts.map