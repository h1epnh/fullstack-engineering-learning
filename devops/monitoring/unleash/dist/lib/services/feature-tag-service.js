"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../error/notfound-error"));
const events_1 = require("../types/events");
const tag_schema_1 = require("./tag-schema");
const error_1 = require("../../lib/error");
class FeatureTagService {
    constructor({ tagStore, featureTagStore, featureToggleStore, }, { getLogger }, eventService) {
        this.logger = getLogger('/services/feature-tag-service.ts');
        this.tagStore = tagStore;
        this.featureTagStore = featureTagStore;
        this.featureToggleStore = featureToggleStore;
        this.eventService = eventService;
    }
    async listTags(featureName) {
        return this.featureTagStore.getAllTagsForFeature(featureName);
    }
    async listFeatures(tagValue) {
        return this.featureTagStore.getAllFeaturesForTag(tagValue);
    }
    // TODO: add project Id
    async addTag(featureName, tag, auditUser) {
        const featureToggle = await this.featureToggleStore.get(featureName);
        if (featureToggle === undefined) {
            throw new notfound_error_1.default();
        }
        const validatedTag = await tag_schema_1.tagSchema.validateAsync(tag);
        await this.createTagIfNeeded(validatedTag, auditUser);
        await this.featureTagStore.tagFeature(featureName, validatedTag, auditUser.id);
        await this.eventService.storeEvent(new events_1.FeatureTaggedEvent({
            featureName,
            project: featureToggle.project,
            data: validatedTag,
            auditUser,
        }));
        return validatedTag;
    }
    async updateTags(featureNames, addedTags, removedTags, auditUser) {
        const featureToggles = await this.featureToggleStore.getAllByNames(featureNames);
        await Promise.all(addedTags.map((tag) => this.createTagIfNeeded(tag, auditUser)));
        const createdFeatureTags = featureNames.flatMap((featureName) => addedTags.map((addedTag) => ({
            featureName,
            tagType: addedTag.type,
            tagValue: addedTag.value,
            createdByUserId: auditUser.id,
        })));
        await this.featureTagStore.tagFeatures(createdFeatureTags);
        const removedFeatureTags = featureNames.flatMap((featureName) => removedTags.map((addedTag) => ({
            featureName,
            tagType: addedTag.type,
            tagValue: addedTag.value,
        })));
        await this.featureTagStore.untagFeatures(removedFeatureTags);
        const creationEvents = featureToggles.flatMap((featureToggle) => addedTags.map((addedTag) => ({
            type: events_1.FEATURE_TAGGED,
            createdBy: auditUser.username,
            featureName: featureToggle.name,
            project: featureToggle.project,
            data: addedTag,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
        })));
        const removalEvents = featureToggles.flatMap((featureToggle) => removedTags.map((removedTag) => ({
            type: events_1.FEATURE_UNTAGGED,
            featureName: featureToggle.name,
            project: featureToggle.project,
            preData: removedTag,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
        })));
        await this.eventService.storeEvents([
            ...creationEvents,
            ...removalEvents,
        ]);
    }
    async createTagIfNeeded(tag, auditUser) {
        try {
            await this.tagStore.getTag(tag.type, tag.value);
        }
        catch (error) {
            if (error instanceof notfound_error_1.default) {
                try {
                    await this.tagStore.createTag(tag);
                    await this.eventService.storeEvent({
                        type: events_1.TAG_CREATED,
                        createdBy: auditUser.username,
                        createdByUserId: auditUser.id,
                        ip: auditUser.ip,
                        data: tag,
                    });
                }
                catch (err) {
                    if (err.code === error_1.FOREIGN_KEY_VIOLATION) {
                        throw new error_1.BadDataError(`Tag type '${tag.type}' does not exist`);
                    }
                }
            }
        }
    }
    // TODO: add project Id
    async removeTag(featureName, tag, auditUser) {
        const featureToggle = await this.featureToggleStore.get(featureName);
        if (featureToggle === undefined) {
            /// No toggle, so no point in removing tags
            return;
        }
        const tags = await this.featureTagStore.getAllTagsForFeature(featureName);
        await this.featureTagStore.untagFeature(featureName, tag);
        await this.eventService.storeEvent({
            type: events_1.FEATURE_UNTAGGED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            featureName,
            project: featureToggle.project,
            preData: tag,
            tags,
        });
    }
}
exports.default = FeatureTagService;
//# sourceMappingURL=feature-tag-service.js.map