"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_utils_1 = require("../utils/test-utils");
describe('Appointments API', () => {
    let authToken;
    let serviceId;
    beforeAll(async () => {
        const { token } = await (0, test_utils_1.createTestUser)();
        const service = await (0, test_utils_1.createTestService)();
        authToken = token;
        serviceId = service.id;
    });
    describe('POST /api/appointments', () => {
        it('should create a new appointment', async () => {
            const appointmentData = {
                serviceId,
                date: new Date().toISOString(),
                notes: 'Test appointment',
            };
            const response = await test_utils_1.testRequest
                .post('/api/appointments')
                .set('Authorization', `Bearer ${authToken}`)
                .send(appointmentData);
            expect(response.status).toBe(201);
            expect(response.body.serviceId).toBe(serviceId);
        });
        it('should validate appointment date', async () => {
            const appointmentData = {
                serviceId,
                date: 'invalid-date',
            };
            const response = await test_utils_1.testRequest
                .post('/api/appointments')
                .set('Authorization', `Bearer ${authToken}`)
                .send(appointmentData);
            expect(response.status).toBe(400);
        });
    });
});
