"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_init_1 = __importDefault(require("../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../fixtures/no-logger"));
const notfound_error_1 = __importDefault(require("../../../lib/error/notfound-error"));
let stores;
let db;
let featureTagStore;
let featureToggleStore;
const featureName = 'test-tag';
const tag = { type: 'simple', value: 'test' };
const TESTUSERID = 3333;
const DEFAULT_TAG_COLOR = '#FFFFFF';
beforeAll(async () => {
    db = await (0, database_init_1.default)('feature_tag_store_serial', no_logger_1.default);
    stores = db.stores;
    featureTagStore = stores.featureTagStore;
    featureToggleStore = stores.featureToggleStore;
    await stores.tagStore.createTag(tag);
    await featureToggleStore.create('default', {
        name: featureName,
        createdByUserId: 9999,
    });
});
afterAll(async () => {
    await stores.tagStore.delete(tag);
    await db.destroy();
});
afterEach(async () => {
    await featureTagStore.deleteAll();
});
test('should tag feature', async () => {
    await featureTagStore.tagFeature(featureName, tag, TESTUSERID);
    const featureTags = await featureTagStore.getAllTagsForFeature(featureName);
    const featureTag = await featureTagStore.get({
        featureName,
        tagType: tag.type,
        tagValue: tag.value,
        createdByUserId: TESTUSERID,
    });
    expect(featureTags).toHaveLength(1);
    expect(featureTags[0]).toStrictEqual({ ...tag, color: DEFAULT_TAG_COLOR });
    expect(featureTag.featureName).toBe(featureName);
    expect(featureTag.tagValue).toBe(tag.value);
});
test('feature tag exists', async () => {
    await featureTagStore.tagFeature(featureName, tag, TESTUSERID);
    const exists = await featureTagStore.exists({
        featureName,
        tagType: tag.type,
        tagValue: tag.value,
        createdByUserId: TESTUSERID,
    });
    expect(exists).toBe(true);
});
test('should delete feature tag', async () => {
    await featureTagStore.tagFeature(featureName, tag, TESTUSERID);
    await featureTagStore.delete({
        featureName,
        tagType: tag.type,
        tagValue: tag.value,
        createdByUserId: TESTUSERID,
    });
    const featureTags = await featureTagStore.getAllTagsForFeature(featureName);
    expect(featureTags).toHaveLength(0);
});
test('should untag feature', async () => {
    await featureTagStore.tagFeature(featureName, tag, TESTUSERID);
    await featureTagStore.untagFeature(featureName, tag);
    const featureTags = await featureTagStore.getAllTagsForFeature(featureName);
    expect(featureTags).toHaveLength(0);
});
test('get all feature tags', async () => {
    await featureTagStore.tagFeature(featureName, tag, TESTUSERID);
    await featureToggleStore.create('default', {
        name: 'some-other-toggle',
        createdByUserId: 9999,
    });
    await featureTagStore.tagFeature('some-other-toggle', tag, TESTUSERID);
    const all = await featureTagStore.getAll();
    expect(all).toHaveLength(2);
});
test('should import feature tags', async () => {
    await featureToggleStore.create('default', {
        name: 'some-other-toggle-import',
        createdByUserId: 9999,
    });
    await featureTagStore.tagFeatures([
        {
            featureName,
            tagType: tag.type,
            tagValue: tag.value,
            createdByUserId: TESTUSERID,
        },
        {
            featureName: 'some-other-toggle-import',
            tagType: tag.type,
            tagValue: tag.value,
            createdByUserId: TESTUSERID,
        },
    ]);
    const all = await featureTagStore.getAll();
    expect(all).toHaveLength(2);
});
test('should throw not found error if feature does not exist', async () => {
    await expect(async () => featureTagStore.getAllTagsForFeature('non.existing.toggle')).rejects.toThrow(new notfound_error_1.default(`Could not find feature with name non.existing.toggle`));
});
test('Returns empty tag list for existing feature with no tags', async () => {
    const name = 'feature.with.no.tags';
    await featureToggleStore.create('default', { name, createdByUserId: 9999 });
    const tags = await featureTagStore.getAllTagsForFeature(name);
    expect(tags).toHaveLength(0);
});
//# sourceMappingURL=feature-tag-store.e2e.test.js.map