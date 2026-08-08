import { type ApiErrorSchema, UnleashError } from '../error/unleash-error';
interface IBaseOptions {
    type: string;
    path: string;
    message: string;
    defaultHidden?: boolean;
}
interface IOptions extends IBaseOptions {
    options?: IBaseOptions[];
}
declare class AuthenticationRequired extends UnleashError {
    statusCode: number;
    private type;
    private path;
    private defaultHidden;
    private options?;
    constructor({ type, path, message, options, defaultHidden, }: IOptions);
    toJSON(): ApiErrorSchema;
}
export default AuthenticationRequired;
//# sourceMappingURL=authentication-required.d.ts.map