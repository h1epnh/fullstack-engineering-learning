import { type ApiErrorSchema, UnleashError } from './unleash-error';
type Permission = string | string[];
declare class PermissionError extends UnleashError {
    statusCode: number;
    permissions: Permission;
    constructor(permission?: Permission, environment?: string);
    toJSON(): ApiErrorSchema;
}
export default PermissionError;
//# sourceMappingURL=permission-error.d.ts.map