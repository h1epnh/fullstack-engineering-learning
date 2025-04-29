export const mockServiceResponse = {
  id: '1',
  name: 'Test Service',
  description: 'Test Description',
  price: 50,
  duration: 60,
  imageUrl: null,
};

export const mockAppointmentResponse = {
  id: '1',
  serviceId: '1',
  customerId: '1',
  date: new Date().toISOString(),
  status: 'PENDING',
};
