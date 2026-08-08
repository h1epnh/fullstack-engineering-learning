import { type ITestDb } from '../helpers/database-init';
import { type FeatureToggle } from '../../../lib/types/model';
import type { ClientFeatureSchema } from '../../../lib/openapi/spec/client-feature-schema';
import type { SegmentSchema } from '../../../lib/openapi/spec/segment-schema';
export declare const seedDatabaseForPlaygroundTest: (database: ITestDb, features: ClientFeatureSchema[], environment: string, segments?: SegmentSchema[]) => Promise<FeatureToggle[]>;
//# sourceMappingURL=playground-service.test.d.ts.map