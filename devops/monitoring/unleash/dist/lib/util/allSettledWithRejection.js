"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allSettledWithRejection = void 0;
const allSettledWithRejection = (promises) => new Promise((resolve, reject) => {
    Promise.allSettled(promises).then((results) => {
        for (const result of results) {
            if (result.status === 'rejected') {
                reject(result.reason);
                return;
            }
        }
        resolve(results.map((r) => r.value));
    });
});
exports.allSettledWithRejection = allSettledWithRejection;
//# sourceMappingURL=allSettledWithRejection.js.map