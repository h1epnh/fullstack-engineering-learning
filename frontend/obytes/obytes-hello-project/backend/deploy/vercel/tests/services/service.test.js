"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_utils_1 = require("../utils/test-utils");
describe('Services API', () => {
    let authToken;
    beforeAll(async () => {
        const { token } = await (0, test_utils_1.createTestUser)();
        authToken = token;
    });
    describe('GET /api/services', () => {
        it('should return all services', async () => {
            const response = await test_utils_1.testRequest
                .get('/api/services')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data)).toBeTruthy();
        });
        it('should handle pagination', async () => {
            const response = await test_utils_1.testRequest
                .get('/api/services?page=1&limit=10')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.pagination).toBeDefined();
            expect(response.body.pagination.current).toBe(1);
        });
    });
    describe('POST /api/services', () => {
        it('should create a new service', async () => {
            const newService = {
                name: 'New Service',
                description: 'New Description',
                price: 75,
                duration: 45,
            };
            const response = await test_utils_1.testRequest
                .post('/api/services')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newService);
            expect(response.status).toBe(201);
            expect(response.body.name).toBe(newService.name);
        });
        it('should validate required fields', async () => {
            const response = await test_utils_1.testRequest
                .post('/api/services')
                .set('Authorization', `Bearer ${authToken}`)
                .send({});
            expect(response.status).toBe(400);
        });
    });
});
