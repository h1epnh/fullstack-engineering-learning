import { API_BASE, http } from './http';

export type TripType = 'BUS' | 'FLIGHT' | 'TRAIN';
export type BookingStatus = 'CONFIRMED' | 'CANCELLED_REFUNDED';

export type TravelTrip = {
  id: string;
  tripType: TripType;
  carrierName: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
};

export type TravelBooking = {
  id: string;
  userId: string;
  tripId: string;
  passengerName: string;
  passengerPhone: string;
  seatNumber: string;
  totalAmount: number;
  bookingCode: string;
  ticketCode: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  trip?: TravelTrip;
};

export const travelBookingService = {
  search: (params: { type?: TripType; origin?: string; destination?: string; date?: string }) => {
    const q = new URLSearchParams();
    if (params.type) q.set('type', params.type);
    if (params.origin) q.set('origin', params.origin);
    if (params.destination) q.set('destination', params.destination);
    if (params.date) q.set('date', params.date);
    const qs = q.toString();
    return http.get<TravelTrip[]>(`${API_BASE.billPayment}/travel/trips/search${qs ? `?${qs}` : ''}`);
  },

  getTrip: (id: string) => http.get<TravelTrip>(`${API_BASE.billPayment}/travel/trips/${id}`),

  book: (data: {
    userId: string;
    tripId: string;
    passengerName: string;
    passengerPhone: string;
    seatNumber?: string;
  }) => http.post<TravelBooking>(`${API_BASE.billPayment}/travel/bookings`, data),

  getBookings: (userId: string) =>
    http.get<TravelBooking[]>(`${API_BASE.billPayment}/travel/bookings?userId=${userId}`),

  cancel: (bookingId: string, userId: string) =>
    http.post<TravelBooking>(`${API_BASE.billPayment}/travel/bookings/${bookingId}/cancel?userId=${userId}`),
};
