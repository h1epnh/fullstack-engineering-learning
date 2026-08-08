"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateObjectCombinations_1 = require("./generateObjectCombinations");
test('should generate all combinations correctly', () => {
    const obj = {
        sessionId: '1,2',
        appName: 'a,b,c',
        channels: 'internet',
        nonString: 1,
    };
    const expectedCombinations = [
        { sessionId: '1', appName: 'a', channels: 'internet', nonString: 1 },
        { sessionId: '1', appName: 'b', channels: 'internet', nonString: 1 },
        { sessionId: '1', appName: 'c', channels: 'internet', nonString: 1 },
        { sessionId: '2', appName: 'a', channels: 'internet', nonString: 1 },
        { sessionId: '2', appName: 'b', channels: 'internet', nonString: 1 },
        { sessionId: '2', appName: 'c', channels: 'internet', nonString: 1 },
    ];
    const actualCombinations = (0, generateObjectCombinations_1.generateObjectCombinations)(obj);
    expect(actualCombinations).toEqual(expectedCombinations);
});
test('should generate all combinations correctly when only one combination', () => {
    const obj = {
        sessionId: '1',
        appName: 'a',
        channels: 'internet',
    };
    const expectedCombinations = [
        { sessionId: '1', appName: 'a', channels: 'internet' },
    ];
    const actualCombinations = (0, generateObjectCombinations_1.generateObjectCombinations)(obj);
    expect(actualCombinations).toEqual(expectedCombinations);
});
test('should generate combinations with nested properties', () => {
    const obj = {
        sessionId: '1,2',
        nonString: 2,
        properties: {
            nonString: 1,
            channels: 'internet',
            appName: 'a,b,c',
        },
    };
    const expectedCombinations = [
        { sessionId: '1', appName: 'a', channels: 'internet', nonString: 1 },
        { sessionId: '1', appName: 'b', channels: 'internet', nonString: 1 },
        { sessionId: '1', appName: 'c', channels: 'internet', nonString: 1 },
        { sessionId: '2', appName: 'a', channels: 'internet', nonString: 1 },
        { sessionId: '2', appName: 'b', channels: 'internet', nonString: 1 },
        { sessionId: '2', appName: 'c', channels: 'internet', nonString: 1 },
    ];
    const actualCombinations = (0, generateObjectCombinations_1.generateObjectCombinations)(obj);
    expect(actualCombinations).toEqual(expectedCombinations);
});
//# sourceMappingURL=generateObjectCombinations.test.js.map