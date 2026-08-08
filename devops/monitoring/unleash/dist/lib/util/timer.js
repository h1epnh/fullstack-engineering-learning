"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NS_TO_S = 1e9;
// seconds takes a tuple of [seconds, nanoseconds]
// and returns the time in seconds
const seconds = (diff) => diff[0] + diff[1] / NS_TO_S;
const newTimer = () => {
    const now = process.hrtime();
    return () => seconds(process.hrtime(now));
};
const timer = {
    seconds,
    new: newTimer,
};
exports.default = timer;
module.exports = {
    seconds,
    new: newTimer,
};
//# sourceMappingURL=timer.js.map