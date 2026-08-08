"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const timer_1 = __importDefault(require("./timer"));
// wrapTimer keeps track of the timing of a async operation and emits
// a event on the given eventBus once the operation is complete
//
// the returned function is designed to stop the timer and emit the event
//
// Usage:
// Define the timer function. It can  be done once per class.
// this.timer = (action: string) =>
//     metricsHelper.wrapTimer(eventBus, DB_TIME, {
//         store: 'client-feature-toggle-read-model',
//         action,
//     });
//
// Before performing an operation, start the timer:
// const stopTimer = this.timer(`timer-name`);
// // perform operation and then stop timer
// stopTimer();
const wrapTimer = (eventBus, event, args = {}) => {
    const t = timer_1.default.new();
    return (data) => {
        args.time = t();
        eventBus.emit(event, args);
        return data;
    };
};
const metricsHelper = {
    wrapTimer,
};
exports.default = metricsHelper;
module.exports = {
    wrapTimer,
};
//# sourceMappingURL=metrics-helper.js.map