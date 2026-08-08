"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureToggleRowConverter = void 0;
const util_1 = require("../../../util");
const sortStrategies_1 = require("../../../util/sortStrategies");
class FeatureToggleRowConverter {
    constructor(flagResolver) {
        this.isUnseenStrategyRow = (feature, row) => {
            return (row.strategy_id &&
                !feature.strategies?.find((strategy) => strategy?.id === row.strategy_id));
        };
        this.isNewTag = (feature, row) => {
            return (row.tag_type &&
                row.tag_value &&
                !feature.tags?.some((tag) => tag?.type === row.tag_type && tag?.value === row.tag_value));
        };
        this.addSegmentToStrategy = (feature, row) => {
            feature.strategies
                ?.find((strategy) => strategy?.id === row.strategy_id)
                ?.constraints?.push(...row.segment_constraints);
        };
        this.addSegmentIdsToStrategy = (feature, row) => {
            const strategy = feature.strategies?.find((strategy) => strategy?.id === row.strategy_id);
            if (!strategy) {
                return;
            }
            if (!strategy.segments) {
                strategy.segments = [];
            }
            strategy.segments.push(row.segment_id);
        };
        this.addLastSeenByEnvironment = (feature, row) => {
            if (!feature.environments) {
                feature.environments = [];
            }
            const found = feature.environments.find((environment) => environment?.name === row.last_seen_at_env);
            if (found) {
                return;
            }
            const newEnvironment = {
                name: row.last_seen_at_env,
                lastSeenAt: row.env_last_seen_at,
                enabled: row.enabled || false,
            };
            if (!newEnvironment.name || !newEnvironment.lastSeenAt) {
                return;
            }
            feature.environments.push(newEnvironment);
        };
        this.rowToStrategy = (row) => {
            return {
                id: row.strategy_id,
                name: row.strategy_name,
                title: row.strategy_title,
                constraints: row.constraints || [],
                parameters: (0, util_1.mapValues)(row.parameters || {}, util_1.ensureStringValue),
                sortOrder: row.sort_order,
                milestoneId: row.milestone_id,
                disabled: row.strategy_disabled,
                variants: row.strategy_variants || [],
            };
        };
        this.addTag = (feature, row) => {
            const tags = feature.tags || [];
            const newTag = this.rowToTag(row);
            feature.tags = [...tags, newTag];
        };
        this.rowToTag = (row) => {
            return {
                value: row.tag_value,
                type: row.tag_type,
            };
        };
        this.formatToggles = (result) => Object.values(result).map(({ strategies, ...rest }) => ({
            ...rest,
            strategies: strategies
                ?.sort(sortStrategies_1.sortStrategies)
                .map(({ title, sortOrder, milestoneId, ...strategy }) => ({
                ...strategy,
                ...(title ? { title } : {}),
            })),
        }));
        this.createBaseFeature = (row, feature, featureQuery) => {
            feature.impressionData = row.impression_data;
            feature.enabled = !!row.enabled;
            feature.name = row.name;
            feature.description = row.description;
            feature.project = row.project;
            feature.stale = row.stale || false;
            feature.type = row.type;
            feature.lastSeenAt = row.last_seen_at;
            feature.variants = row.variants || [];
            feature.project = row.project;
            if (this.isUnseenStrategyRow(feature, row)) {
                feature.strategies?.push(this.rowToStrategy(row));
            }
            if (this.isNewTag(feature, row)) {
                this.addTag(feature, row);
            }
            if (featureQuery?.inlineSegmentConstraints && row.segment_id) {
                this.addSegmentToStrategy(feature, row);
            }
            else if (!featureQuery?.inlineSegmentConstraints && row.segment_id) {
                this.addSegmentIdsToStrategy(feature, row);
            }
            return feature;
        };
        this.buildFeatureToggleListFromRows = (rows, featureQuery, includeDisabledStrategies) => {
            const result = rows.reduce((acc, r) => {
                let feature = acc[r.name] ?? {
                    strategies: [],
                    stale: r.stale || false,
                };
                feature = this.createBaseFeature(r, feature, featureQuery);
                feature.createdAt = r.created_at;
                feature.favorite = r.favorite;
                this.addLastSeenByEnvironment(feature, r);
                acc[r.name] = feature;
                return acc;
            }, {});
            return this.formatToggles(result);
        };
        this.buildPlaygroundFeaturesFromRows = (rows, featureQuery) => {
            const result = rows.reduce((acc, r) => {
                let feature = acc[r.name] ?? {
                    strategies: [],
                };
                feature = this.createBaseFeature(r, feature, featureQuery);
                if (r.parent) {
                    feature.dependencies = feature.dependencies || [];
                    feature.dependencies.push({
                        feature: r.parent,
                        enabled: r.parent_enabled,
                        ...(r.parent_enabled
                            ? { variants: r.parent_variants }
                            : {}),
                    });
                }
                acc[r.name] = feature;
                return acc;
            }, {});
            return this.formatToggles(result);
        };
        this.buildArchivedFeatureToggleListFromRows = (rows) => {
            const result = rows.reduce((acc, row) => {
                const feature = acc[row.name] ?? {};
                feature.name = row.name;
                feature.description = row.description;
                feature.type = row.type;
                feature.project = row.project;
                feature.stale = row.stale;
                feature.createdAt = row.created_at;
                feature.impressionData = row.impression_data;
                feature.lastSeenAt = row.last_seen_at;
                feature.archivedAt = row.archived_at;
                this.addLastSeenByEnvironment(feature, row);
                acc[row.name] = feature;
                return acc;
            }, {});
            return Object.values(result);
        };
        this.flagResolver = flagResolver;
    }
}
exports.FeatureToggleRowConverter = FeatureToggleRowConverter;
//# sourceMappingURL=feature-toggle-row-converter.js.map