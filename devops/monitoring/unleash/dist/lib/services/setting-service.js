"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("../types/events");
class SettingService {
    constructor({ settingStore }, config, eventService) {
        this.config = config;
        this.logger = config.getLogger('services/setting-service.ts');
        this.settingStore = settingStore;
        this.eventService = eventService;
    }
    /**
     * @deprecated use getWithDefault instead
     */
    async get(id, defaultValue) {
        const value = await this.settingStore.get(id);
        return value || defaultValue;
    }
    async getWithDefault(id, defaultValue) {
        const value = await this.settingStore.get(id);
        return value || defaultValue;
    }
    async insert(id, value, auditUser, hideEventDetails = true) {
        const existingSettings = await this.settingStore.get(id);
        let data = { id, ...value };
        let preData = existingSettings;
        if (hideEventDetails) {
            preData = { hideEventDetails: true };
            data = { id, hideEventDetails: true };
        }
        if (existingSettings) {
            await this.settingStore.updateRow(id, value);
            await this.eventService.storeEvent(new events_1.SettingUpdatedEvent({
                data,
                auditUser,
            }, preData));
        }
        else {
            await this.settingStore.insert(id, value);
            await this.eventService.storeEvent(new events_1.SettingCreatedEvent({
                auditUser,
                data,
            }));
        }
    }
    async delete(id, auditUser) {
        await this.settingStore.delete(id);
        await this.eventService.storeEvent(new events_1.SettingDeletedEvent({
            auditUser,
            data: {
                id,
            },
        }));
    }
    async deleteAll() {
        await this.settingStore.deleteAll();
    }
}
exports.default = SettingService;
//# sourceMappingURL=setting-service.js.map