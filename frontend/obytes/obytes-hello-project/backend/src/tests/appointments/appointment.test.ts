import { testRequest, createTestUser, createTestService } from '../utils/test-utils';

describe('Appointments API', () => {
  let authToken: string;
  let serviceId: string;

  beforeAll(async () => {
    const { token } = await createTestUser();
    const service = await createTestService();
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

      const response = await testRequest
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

      const response = await testRequest
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(appointmentData);

      expect(response.status).toBe(400);
    });
  });
});
