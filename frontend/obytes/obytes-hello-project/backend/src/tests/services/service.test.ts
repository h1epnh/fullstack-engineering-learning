import { testRequest, createTestUser } from '../utils/test-utils';

describe('Services API', () => {
  let authToken: string;

  beforeAll(async () => {
    const { token } = await createTestUser();
    authToken = token;
  });

  describe('GET /api/services', () => {
    it('should return all services', async () => {
      const response = await testRequest
        .get('/api/services')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    it('should handle pagination', async () => {
      const response = await testRequest
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

      const response = await testRequest
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newService);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newService.name);
    });

    it('should validate required fields', async () => {
      const response = await testRequest
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });
});
