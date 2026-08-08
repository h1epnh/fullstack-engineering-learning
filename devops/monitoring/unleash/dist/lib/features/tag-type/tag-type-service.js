"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const name_exists_error_1 = __importDefault(require("../../error/name-exists-error"));
const tag_type_schema_1 = require("../../services/tag-type-schema");
const events_1 = require("../../types/events");
const error_1 = require("../../error");
class TagTypeService {
    constructor({ tagTypeStore }, { getLogger }, eventService) {
        this.tagTypeStore = tagTypeStore;
        this.eventService = eventService;
        this.logger = getLogger('services/tag-type-service.js');
    }
    async getAll() {
        return this.tagTypeStore.getAll();
    }
    async getTagType(name) {
        const tagType = await this.tagTypeStore.get(name);
        if (tagType === undefined) {
            throw new error_1.NotFoundError(`Tagtype ${name} could not be found`);
        }
        return tagType;
    }
    async createTagType(newTagType, auditUser) {
        const data = (await tag_type_schema_1.tagTypeSchema.validateAsync(newTagType));
        await this.validateUnique(data.name);
        await this.tagTypeStore.createTagType(data);
        await this.eventService.storeEvent(new events_1.TagTypeCreatedEvent({
            auditUser,
            data,
        }));
        return data;
    }
    async validateUnique(name) {
        const exists = await this.tagTypeStore.exists(name);
        if (exists) {
            throw new name_exists_error_1.default(`There already exists a tag-type with the name ${name}`);
        }
        return Promise.resolve(true);
    }
    async validate(tagType) {
        await tag_type_schema_1.tagTypeSchema.validateAsync(tagType);
        if (tagType?.name) {
            await this.validateUnique(tagType.name);
        }
    }
    async deleteTagType(name, auditUser) {
        const tagType = await this.tagTypeStore.get(name);
        await this.tagTypeStore.delete(name);
        await this.eventService.storeEvent(new events_1.TagTypeDeletedEvent({
            preData: tagType,
            auditUser,
        }));
    }
    async updateTagType(updatedTagType, auditUser) {
        const data = await tag_type_schema_1.tagTypeSchema.validateAsync(updatedTagType);
        await this.tagTypeStore.updateTagType(data);
        await this.eventService.storeEvent(new events_1.TagTypeUpdatedEvent({
            data,
            auditUser,
        }));
        return data;
    }
}
exports.default = TagTypeService;
module.exports = TagTypeService;
//# sourceMappingURL=tag-type-service.js.map