"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tag_schema_1 = require("./tag-schema");
const name_exists_error_1 = __importDefault(require("../error/name-exists-error"));
const events_1 = require("../types/events");
class TagService {
    constructor({ tagStore }, { getLogger }, eventService) {
        this.tagStore = tagStore;
        this.eventService = eventService;
        this.logger = getLogger('services/tag-service.js');
    }
    async getTags() {
        return this.tagStore.getAll();
    }
    async getTagsByType(type) {
        return this.tagStore.getTagsByType(type);
    }
    async getTag({ type, value }) {
        return this.tagStore.getTag(type, value);
    }
    async validateUnique(tag) {
        const exists = await this.tagStore.exists(tag);
        if (exists) {
            throw new name_exists_error_1.default(`A tag of ${tag} already exists`);
        }
    }
    async validate(tag) {
        const data = (await tag_schema_1.tagSchema.validateAsync(tag));
        await this.validateUnique(tag);
        return data;
    }
    async createTag(tag, auditUser) {
        const trimmedTag = {
            ...tag,
            value: tag.value.trim(),
        };
        const data = await this.validate(trimmedTag);
        await this.tagStore.createTag(data);
        await this.eventService.storeEvent(new events_1.TagCreatedEvent({
            data,
            auditUser,
        }));
        return data;
    }
    async deleteTag(tag, auditUser) {
        await this.tagStore.delete(tag);
        await this.eventService.storeEvent(new events_1.TagDeletedEvent({
            data: tag,
            auditUser,
        }));
    }
}
exports.default = TagService;
module.exports = TagService;
//# sourceMappingURL=tag-service.js.map