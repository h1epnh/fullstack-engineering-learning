"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sharedEventEmitter = exports.AnyEventEmitter = exports.ANY_EVENT = void 0;
const events_1 = __importDefault(require("events"));
exports.ANY_EVENT = '*';
// Extends the built-in EventEmitter with support for listening for any event.
// See https://stackoverflow.com/a/54431931.
class AnyEventEmitter extends events_1.default {
    emit(type, ...args) {
        super.emit(exports.ANY_EVENT, ...args);
        return super.emit(type, ...args) || super.emit('', ...args);
    }
}
exports.AnyEventEmitter = AnyEventEmitter;
exports.sharedEventEmitter = new AnyEventEmitter();
//# sourceMappingURL=anyEventEmitter.js.map