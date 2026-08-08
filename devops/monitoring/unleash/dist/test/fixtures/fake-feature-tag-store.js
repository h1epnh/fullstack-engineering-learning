"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FakeFeatureTagStore {
    constructor() {
        this.featureTags = [];
    }
    async getAllTagsForFeature(featureName) {
        const tags = this.featureTags
            .filter((f) => f.featureName === featureName)
            .map((f) => ({
            type: f.tagType,
            value: f.tagValue,
        }));
        return Promise.resolve(tags);
    }
    async getAllFeaturesForTag(tagValue) {
        const tags = this.featureTags
            .filter((f) => f.tagValue === tagValue)
            .map((f) => f.featureName);
        return Promise.resolve(tags);
    }
    async delete(key) {
        this.featureTags.splice(this.featureTags.findIndex((t) => t === key), 1);
    }
    destroy() { }
    async exists(key) {
        return this.featureTags.some((t) => t === key);
    }
    async get(key) {
        return this.featureTags.find((t) => t === key);
    }
    async getAll() {
        return this.featureTags;
    }
    async tagFeature(featureName, tag, createdByUserId) {
        this.featureTags.push({
            featureName,
            tagType: tag.type,
            tagValue: tag.value,
            createdByUserId,
        });
        return Promise.resolve(tag);
    }
    async getAllFeatureTags() {
        return Promise.resolve(this.featureTags);
    }
    async deleteAll() {
        this.featureTags = [];
        return Promise.resolve();
    }
    async tagFeatures(featureTags) {
        return Promise.all(featureTags.map(async (fT) => {
            const saved = await this.tagFeature(fT.featureName, {
                value: fT.tagValue,
                type: fT.tagType,
            }, fT.createdByUserId || -1337);
            return {
                featureName: fT.featureName,
                tag: saved,
            };
        }));
    }
    async untagFeature(featureName, tag) {
        this.featureTags = this.featureTags.filter((fT) => {
            if (fT.featureName === featureName) {
                return !(fT.tagType === tag.type && fT.tagValue === tag.value);
            }
            return true;
        });
        return Promise.resolve();
    }
    getAllByFeatures(features) {
        return Promise.resolve(this.featureTags.filter((tag) => features.includes(tag.featureName)));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    untagFeatures(featureTags) {
        throw new Error('Method not implemented.');
    }
}
exports.default = FakeFeatureTagStore;
module.exports = FakeFeatureTagStore;
//# sourceMappingURL=fake-feature-tag-store.js.map