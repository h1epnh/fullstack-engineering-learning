"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noLoggerProvider = noLoggerProvider;
let muteError = false;
let verbose = false;
function noLoggerProvider() {
    // do something with the name
    return {
        debug: verbose ? console.log : () => { },
        info: verbose ? console.log : () => { },
        warn: verbose ? console.warn : () => { },
        error: muteError ? () => { } : console.error,
        fatal: console.error,
    };
}
noLoggerProvider.setMuteError = (mute) => {
    muteError = mute;
};
// use for debugging only, try not to commit tests with verbose set to true
noLoggerProvider.setVerbose = (beVerbose) => {
    verbose = beVerbose;
};
module.exports = noLoggerProvider;
exports.default = noLoggerProvider;
//# sourceMappingURL=no-logger.js.map