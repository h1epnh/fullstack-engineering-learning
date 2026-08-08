import type { Db, IUnleashConfig } from '../../server-impl';
import { PrivateProjectChecker } from './privateProjectChecker';
import { FakePrivateProjectChecker } from './fakePrivateProjectChecker';
export declare const createPrivateProjectChecker: (db: Db, config: IUnleashConfig) => PrivateProjectChecker;
export declare const createFakePrivateProjectChecker: () => FakePrivateProjectChecker;
//# sourceMappingURL=createPrivateProjectChecker.d.ts.map