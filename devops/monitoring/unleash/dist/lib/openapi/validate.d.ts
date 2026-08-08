import { type ErrorObject } from 'ajv';
import { type SchemaId } from './index';
export interface ISchemaValidationErrors<S = SchemaId> {
    schema: S;
    errors: ErrorObject[];
}
export declare const addAjvSchema: (schemaObjects: any[]) => any;
export declare const validateSchema: <S = SchemaId>(schema: S, data: unknown) => ISchemaValidationErrors<S> | undefined;
export declare const throwOnInvalidSchema: <S = SchemaId>(schema: S, data: object) => void;
//# sourceMappingURL=validate.d.ts.map