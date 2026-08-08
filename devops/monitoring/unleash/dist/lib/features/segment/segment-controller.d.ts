import type { Request, Response } from 'express';
import Controller from '../../routes/controller';
import type { IAuthRequest, IUnleashConfig, IUnleashServices } from '../../server-impl';
import { type AdminSegmentSchema, type UpdateFeatureStrategySegmentsSchema, type UpsertSegmentSchema } from '../../openapi';
import type { SegmentStrategiesSchema } from '../../openapi/spec/segment-strategies-schema';
import { type SegmentsSchema } from '../../openapi/spec/segments-schema';
type IUpdateFeatureStrategySegmentsRequest = IAuthRequest<{}, undefined, UpdateFeatureStrategySegmentsSchema>;
export declare class SegmentsController extends Controller {
    private logger;
    private segmentService;
    private accessService;
    private flagResolver;
    private openApiService;
    constructor(config: IUnleashConfig, { segmentService, accessService, openApiService, }: Pick<IUnleashServices, 'segmentService' | 'accessService' | 'openApiService'>);
    validate(req: Request<unknown, unknown, {
        name: string;
    }>, res: Response): Promise<void>;
    getSegmentsByStrategy(req: Request<{
        strategyId: string;
    }>, res: Response<SegmentsSchema>): Promise<void>;
    updateFeatureStrategySegments(req: IUpdateFeatureStrategySegmentsRequest, res: Response<UpdateFeatureStrategySegmentsSchema>): Promise<void>;
    getStrategiesBySegment(req: IAuthRequest<{
        id: number;
    }>, res: Response<SegmentStrategiesSchema>): Promise<void>;
    removeSegment(req: IAuthRequest<{
        id: number;
    }>, res: Response): Promise<void>;
    updateSegment(req: IAuthRequest<{
        id: number;
    }>, res: Response): Promise<void>;
    getSegment(req: Request<{
        id: number;
    }>, res: Response): Promise<void>;
    createSegment(req: IAuthRequest<any, any, UpsertSegmentSchema>, res: Response<AdminSegmentSchema>): Promise<void>;
    getSegments(req: IAuthRequest, res: Response<SegmentsSchema>): Promise<void>;
    private removeFromStrategy;
    private addToStrategy;
}
export {};
//# sourceMappingURL=segment-controller.d.ts.map