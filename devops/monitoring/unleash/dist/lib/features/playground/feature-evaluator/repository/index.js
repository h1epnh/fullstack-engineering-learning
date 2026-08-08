"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const unleash_client_1 = require("unleash-client");
class Repository extends stream_1.EventEmitter {
    constructor({ appName, bootstrapProvider, storageProvider, }) {
        super();
        this.data = {};
        this.appName = appName;
        this.bootstrapProvider = bootstrapProvider;
        this.storageProvider = storageProvider;
        this.segments = new Map();
    }
    async start() {
        await this.loadBootstrap();
        process.nextTick(() => this.emit(unleash_client_1.UnleashEvents.Ready));
    }
    createSegmentLookup(segments) {
        if (!segments) {
            return new Map();
        }
        return new Map(segments.map((segment) => [segment.id, segment]));
    }
    async save(response) {
        this.data = this.convertToMap(response.features);
        this.segments = this.createSegmentLookup(response.segments);
        await this.storageProvider.set(this.appName, response);
    }
    notEmpty(content) {
        return content.features.length > 0;
    }
    async loadBootstrap() {
        try {
            const content = await this.bootstrapProvider.readBootstrap();
            if (content && this.notEmpty(content)) {
                await this.save(content);
            }
        }
        catch (err) {
            // intentionally left empty
        }
    }
    convertToMap(features) {
        const obj = features.reduce((o, feature) => {
            const a = { ...o };
            a[feature.name] = feature;
            return a;
        }, {});
        return obj;
    }
    stop() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
    getSegment(segmentId) {
        return this.segments.get(segmentId);
    }
    getToggle(name) {
        return this.data[name];
    }
    getToggles() {
        return Object.keys(this.data).map((key) => this.data[key]);
    }
}
exports.default = Repository;
//# sourceMappingURL=index.js.map