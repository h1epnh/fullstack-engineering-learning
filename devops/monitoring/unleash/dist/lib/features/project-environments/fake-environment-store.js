"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notfound_error_1 = __importDefault(require("../../error/notfound-error"));
class FakeEnvironmentStore {
    constructor() {
        this.environments = [];
    }
    importEnvironments(envs) {
        this.environments = envs;
        return Promise.resolve(envs);
    }
    disable(environments) {
        for (const env of this.environments) {
            if (environments.map((e) => e.name).includes(env.name))
                env.enabled = false;
        }
        return Promise.resolve();
    }
    enable(environments) {
        for (const env of this.environments) {
            if (environments.map((e) => e.name).includes(env.name))
                env.enabled = true;
        }
        return Promise.resolve();
    }
    count() {
        return Promise.resolve(this.environments.length);
    }
    async getAll() {
        return Promise.resolve(this.environments);
    }
    async exists(name) {
        return this.environments.some((e) => e.name === name);
    }
    async getByName(name) {
        const env = this.environments.find((e) => e.name === name);
        if (env) {
            return Promise.resolve(env);
        }
        return Promise.reject(new notfound_error_1.default(`Could not find environment with name ${name}`));
    }
    async create(env) {
        this.environments = this.environments.filter((e) => e.name !== env.name);
        this.environments.push(env);
        return Promise.resolve(env);
    }
    async update(env, name) {
        const found = this.environments.find((en) => en.name === name);
        const idx = this.environments.findIndex((en) => en.name === name);
        const updated = { ...found, env };
        this.environments[idx] = updated;
        return Promise.resolve(updated);
    }
    async updateSortOrder(id, value) {
        const environment = this.environments.find((env) => env.name === id);
        environment.sortOrder = value;
        return Promise.resolve();
    }
    async updateProperty(id, field, value) {
        const environment = this.environments.find((env) => env.name === id);
        environment[field] = value;
        return Promise.resolve();
    }
    async toggle(name, enabled) {
        const environment = this.environments.find((env) => env.name === name);
        if (environment)
            environment.enabled = enabled;
        return Promise.resolve();
    }
    async connectProject(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    environment, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    projectId) {
        return Promise.reject(new Error('Not implemented'));
    }
    async connectFeatures(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    environment, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    projectId) {
        return Promise.reject(new Error('Not implemented'));
    }
    async delete(name) {
        this.environments = this.environments.filter((e) => e.name !== name);
        return Promise.resolve();
    }
    async deleteAll() {
        this.environments = [];
    }
    destroy() { }
    async get(key) {
        return Promise.resolve(this.environments.find((e) => e.name === key));
    }
    async getAllWithCounts() {
        return Promise.resolve(this.environments);
    }
    async getProjectEnvironments(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    projectId) {
        return Promise.reject(new Error('Not implemented'));
    }
    getMaxSortOrder() {
        return Promise.resolve(0);
    }
}
exports.default = FakeEnvironmentStore;
module.exports = FakeEnvironmentStore;
//# sourceMappingURL=fake-environment-store.js.map