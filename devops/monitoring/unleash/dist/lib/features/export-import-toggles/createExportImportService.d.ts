import type { Db } from '../../db/db';
import type { IUnleashConfig } from '../../types';
import ExportImportService from './export-import-service';
import type { DeferredServiceFactory } from '../../db/transaction';
export declare const createFakeExportImportTogglesService: (config: IUnleashConfig) => ExportImportService;
export declare const deferredExportImportTogglesService: (config: IUnleashConfig) => DeferredServiceFactory<ExportImportService>;
export declare const createExportImportTogglesService: (db: Db, config: IUnleashConfig) => ExportImportService;
//# sourceMappingURL=createExportImportService.d.ts.map