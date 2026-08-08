import type { Knex } from 'knex';
export declare class FeatureToggleListBuilder {
    private db;
    internalQuery: Knex.QueryBuilder;
    private selectColumns;
    constructor(db: any, selectColumns: any);
    getSelectColumns: () => (string | Knex.Raw<any>)[];
    query: (table: string) => this;
    addSelectColumn: (column: string | Knex.Raw<any>) => void;
    withArchived: (includeArchived: boolean) => this;
    withStrategies: (filter: string) => this;
    withFeatureEnvironments: (filter: string) => this;
    withFeatureStrategySegments: () => this;
    withSegments: () => this;
    withDependentFeatureToggles: () => this;
    withFeatureTags: () => this;
    withLastSeenByEnvironment: (archived?: boolean) => this;
    withFavorites: (userId: number) => this;
    forProject: (project: string[]) => void;
}
//# sourceMappingURL=feature-toggle-list-builder.d.ts.map