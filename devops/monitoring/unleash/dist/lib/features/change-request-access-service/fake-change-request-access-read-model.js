"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeChangeRequestAccessReadModel = void 0;
class FakeChangeRequestAccessReadModel {
    constructor(canBypass = true, isChangeRequestEnabled = true) {
        this.canBypass = canBypass;
        this.isChangeRequestEnabled = isChangeRequestEnabled;
    }
    async canBypassChangeRequest() {
        return this.canBypass;
    }
    async canBypassChangeRequestForProject() {
        return this.canBypass;
    }
    async isChangeRequestsEnabled() {
        return this.isChangeRequestEnabled;
    }
    async isChangeRequestsEnabledForProject() {
        return this.isChangeRequestEnabled;
    }
}
exports.FakeChangeRequestAccessReadModel = FakeChangeRequestAccessReadModel;
//# sourceMappingURL=fake-change-request-access-read-model.js.map