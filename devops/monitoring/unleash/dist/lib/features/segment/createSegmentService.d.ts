import type { Db, IUnleashConfig } from '../../server-impl';
import { SegmentService } from '../../services';
import type { ISegmentService } from './segment-service-interface';
export declare const createSegmentService: (db: Db, config: IUnleashConfig) => SegmentService;
export declare const createFakeSegmentService: (config: IUnleashConfig) => ISegmentService;
//# sourceMappingURL=createSegmentService.d.ts.map