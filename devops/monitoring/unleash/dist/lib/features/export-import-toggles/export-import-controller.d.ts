import type { Response } from 'express';
import Controller from '../../routes/controller';
import { type IUnleashConfig, type IUnleashServices } from '../../types';
import { type ExportQuerySchema, type ImportTogglesSchema } from '../../openapi';
import type { IAuthRequest } from '../../routes/unleash-types';
declare class ExportImportController extends Controller {
    private logger;
    private exportService;
    private importService;
    private openApiService;
    constructor(config: IUnleashConfig, { exportService, importService, openApiService, }: Pick<IUnleashServices, 'exportService' | 'importService' | 'openApiService'>);
    export(req: IAuthRequest<unknown, unknown, ExportQuerySchema, unknown>, res: Response): Promise<void>;
    validateImport(req: IAuthRequest<unknown, unknown, ImportTogglesSchema, unknown>, res: Response): Promise<void>;
    importData(req: IAuthRequest<unknown, unknown, ImportTogglesSchema, unknown>, res: Response): Promise<void>;
}
export default ExportImportController;
//# sourceMappingURL=export-import-controller.d.ts.map