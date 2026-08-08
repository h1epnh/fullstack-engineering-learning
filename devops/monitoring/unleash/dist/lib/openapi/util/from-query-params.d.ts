import type { FromSchema, JSONSchema } from 'json-schema-to-ts';
import type { O, L, A } from 'ts-toolbelt';
type OpenApiParam = {
    readonly name: string;
    readonly schema: JSONSchema;
    readonly in: 'query' | 'path' | 'header' | 'cookie';
    readonly description?: string;
};
type RecurseOnParams<P extends readonly OpenApiParam[], R extends O.Object = {}> = {
    continue: RecurseOnParams<L.Tail<P>, L.Head<P>['in'] extends 'query' ? R & {
        [key in L.Head<P>['name']]: FromSchema<L.Head<P>['schema']>;
    } : R>;
    stop: A.Compute<R>;
}[P extends readonly [OpenApiParam, ...OpenApiParam[]] ? 'continue' : 'stop'];
export type FromQueryParams<P extends readonly OpenApiParam[]> = RecurseOnParams<P>;
export {};
//# sourceMappingURL=from-query-params.d.ts.map