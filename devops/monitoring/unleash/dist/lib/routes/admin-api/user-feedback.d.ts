import Controller from '../controller';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
declare class UserFeedbackController extends Controller {
    private logger;
    private userFeedbackService;
    private openApiService;
    constructor(config: IUnleashConfig, { userFeedbackService, openApiService, }: Pick<IUnleashServices, 'userFeedbackService' | 'openApiService'>);
    private createFeedback;
    private updateFeedback;
}
export default UserFeedbackController;
//# sourceMappingURL=user-feedback.d.ts.map