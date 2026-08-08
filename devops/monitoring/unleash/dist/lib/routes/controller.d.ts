import { type IRouter, type Request, type Response, type RequestHandler } from 'express';
import { type IUnleashConfig } from '../types';
type IRequestHandler<P = any, ResBody = any, ReqBody = any, ReqQuery = any> = (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>) => Promise<void> | void;
type Permission = string | string[];
interface IRouteOptionsBase {
    path: string;
    permission: Permission;
    middleware?: RequestHandler[];
    handler: IRequestHandler;
    acceptedContentTypes?: string[];
}
interface IRouteOptionsGet extends IRouteOptionsBase {
    method: 'get';
}
interface IRouteOptionsNonGet extends IRouteOptionsBase {
    method: 'post' | 'put' | 'patch' | 'delete';
    acceptAnyContentType?: boolean;
}
type IRouteOptions = IRouteOptionsNonGet | IRouteOptionsGet;
/**
 * Base class for Controllers to standardize binding to express Router.
 *
 * This class will take care of the following:
 * - try/catch inside RequestHandler
 * - await if the RequestHandler returns a promise.
 * - access control
 */
export default class Controller {
    private ownLogger;
    app: IRouter;
    config: IUnleashConfig;
    constructor(config: IUnleashConfig);
    private useRouteErrorHandler;
    private useContentTypeMiddleware;
    route(options: IRouteOptions): void;
    get(path: string, handler: IRequestHandler, permission?: Permission): void;
    post(path: string, handler: IRequestHandler, permission?: Permission, ...acceptedContentTypes: string[]): void;
    put(path: string, handler: IRequestHandler, permission?: Permission, ...acceptedContentTypes: string[]): void;
    patch(path: string, handler: IRequestHandler, permission?: Permission, ...acceptedContentTypes: string[]): void;
    delete(path: string, handler: IRequestHandler, permission?: Permission): void;
    fileupload(path: string, filehandler: IRequestHandler, handler: Function, permission?: Permission): void;
    use(path: string, router: IRouter): void;
    useWithMiddleware(path: string, router: IRouter, middleware: any): void;
    get router(): IRouter;
}
export {};
//# sourceMappingURL=controller.d.ts.map