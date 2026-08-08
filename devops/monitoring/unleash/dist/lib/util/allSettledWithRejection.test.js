"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const allSettledWithRejection_1 = require("./allSettledWithRejection");
describe('allSettledWithRejection', () => {
    it('should resolve if all promises resolve', async () => {
        const promises = [
            Promise.resolve(1),
            Promise.resolve(2),
            Promise.resolve(3),
        ];
        await expect((0, allSettledWithRejection_1.allSettledWithRejection)(promises)).resolves.toEqual([
            1, 2, 3,
        ]);
    });
    it('should reject with the reason of the first rejected promise', async () => {
        const error = new Error('First rejection');
        const promises = [
            Promise.reject(error),
            Promise.resolve(1),
            Promise.resolve(2),
        ];
        await expect((0, allSettledWithRejection_1.allSettledWithRejection)(promises)).rejects.toEqual(error);
    });
    it('should reject with the reason of the first rejected promise, even with multiple rejections', async () => {
        const firstError = new Error('First rejection');
        const secondError = new Error('Second rejection');
        const promises = [
            Promise.reject(firstError),
            Promise.reject(secondError),
            Promise.resolve(1),
        ];
        await expect((0, allSettledWithRejection_1.allSettledWithRejection)(promises)).rejects.toEqual(firstError);
    });
    it('should reject with the reason of the first rejected promise in mixed scenarios', async () => {
        const error = new Error('Rejection');
        const promises = [
            Promise.resolve(1),
            Promise.reject(error),
            Promise.resolve(2),
        ];
        await expect((0, allSettledWithRejection_1.allSettledWithRejection)(promises)).rejects.toEqual(error);
    });
});
//# sourceMappingURL=allSettledWithRejection.test.js.map