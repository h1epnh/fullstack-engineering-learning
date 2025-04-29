"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockAppointmentResponse = exports.mockServiceResponse = void 0;
exports.mockServiceResponse = {
    id: '1',
    name: 'Test Service',
    description: 'Test Description',
    price: 50,
    duration: 60,
    imageUrl: null,
};
exports.mockAppointmentResponse = {
    id: '1',
    serviceId: '1',
    customerId: '1',
    date: new Date().toISOString(),
    status: 'PENDING',
};
