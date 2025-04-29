import { testRequest, createTestUser, createTestService } from '../utils/test-utils';

describe('Booking Flow Integration', () => {
  let authToken: string;
  let serviceId: string;

  beforeAll(async () => {
    const { token } = await createTestUser();
    const service = await createTestService();
    authToken = token;
    serviceId = service.id;
  });

  it('should complete full booking flow', async () => {
    // 1. Get available services
    const servicesResponse = await testRequest
      .get('/api/services')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(servicesResponse.status).toBe(200);
    
    // 2. Create appointment
    const appointmentData = {
      serviceId,
      date: new Date().toISOString(),
    };
    
    const bookingResponse = await testRequest
      .post('/api/appointments')
      .set('Authorization', `Bearer ${authToken}`)
      .send(appointmentData);
    
    expect(bookingResponse.status).toBe(201);
    const appointmentId = bookingResponse.body.id;
    
    // 3. Confirm appointment
    const confirmResponse = await testRequest
      .put(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'CONFIRMED' });
    
    expect(confirmResponse.status).toBe(200);
    expect(confirmResponse.body.status).toBe('CONFIRMED');
  });
});
