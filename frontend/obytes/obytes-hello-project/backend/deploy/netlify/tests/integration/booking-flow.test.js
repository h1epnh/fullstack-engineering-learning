"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_utils_1 = require("../utils/test-utils");
describe('Booking Flow Integration', () => {
    let authToken;
    let serviceId;
    beforeAll(async () => {
        const { token } = await (0, test_utils_1.createTestUser)();
        const service = await (0, test_utils_1.createTestService)();
        authToken = token;
        serviceId = service.id;
    });
    it('should complete full booking flow', async () => {
        // 1. Get available services
        const servicesResponse = await test_utils_1.testRequest
            .get('/api/services')
            .set('Authorization', `Bearer ${authToken}`);
        expect(servicesResponse.status).toBe(200);
        // 2. Create appointment
        const appointmentData = {
            serviceId,
            date: new Date().toISOString(),
        };
        const bookingResponse = await test_utils_1.testRequest
            .post('/api/appointments')
            .set('Authorization', `Bearer ${authToken}`)
            .send(appointmentData);
        expect(bookingResponse.status).toBe(201);
        const appointmentId = bookingResponse.body.id;
        // 3. Confirm appointment
        const confirmResponse = await test_utils_1.testRequest
            .put(`/api/appointments/${appointmentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ status: 'CONFIRMED' });
        expect(confirmResponse.status).toBe(200);
        expect(confirmResponse.body.status).toBe('CONFIRMED');
    });
});
