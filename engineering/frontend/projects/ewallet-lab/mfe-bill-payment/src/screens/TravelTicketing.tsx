import {
  type TravelBooking,
  type TravelTrip,
  type TripType,
  travelBookingService,
} from '@ewallet-lab/api-client';
import { Button, Card, EmptyState, Icon, StatusPill, TextField, formatVnd } from '@ewallet-lab/ui';
import { useEffect, useState } from 'react';

export function TravelTicketing({ userId }: { userId: string }) {
  const [view, setView] = useState<'search' | 'my-tickets'>('search');
  const [tripType, setTripType] = useState<TripType | undefined>(undefined);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  const [trips, setTrips] = useState<TravelTrip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Booking state
  const [selectedTrip, setSelectedTrip] = useState<TravelTrip | null>(null);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<TravelBooking | null>(null);

  // Tickets state
  const [myBookings, setMyBookings] = useState<TravelBooking[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  function loadTrips() {
    setLoading(true);
    setError(null);
    travelBookingService
      .search({
        type: tripType,
        origin: origin.trim() || undefined,
        destination: destination.trim() || undefined,
        date: date || undefined,
      })
      .then(setTrips)
      .catch((err) => setError(err.message || 'Không thể tải danh sách chuyến đi'))
      .finally(() => setLoading(false));
  }

  function loadMyTickets() {
    setTicketsLoading(true);
    travelBookingService
      .getBookings(userId)
      .then(setMyBookings)
      .catch(() => setMyBookings([]))
      .finally(() => setTicketsLoading(false));
  }

  useEffect(() => {
    loadTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (view === 'my-tickets') {
      loadMyTickets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  async function handleBookTicket() {
    if (!selectedTrip) return;
    if (!passengerName.trim()) {
      setBookingError('Vui lòng nhập họ tên hành khách');
      return;
    }
    if (!passengerPhone.trim()) {
      setBookingError('Vui lòng nhập số điện thoại');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);
    try {
      const res = await travelBookingService.book({
        userId,
        tripId: selectedTrip.id,
        passengerName: passengerName.trim(),
        passengerPhone: passengerPhone.trim(),
        seatNumber: seatNumber.trim() || undefined,
      });
      setSuccessBooking(res);
      setSelectedTrip(null);
      // Reload trips to update seat count
      loadTrips();
    } catch (e: any) {
      setBookingError(e.message || 'Đặt vé thất bại, vui lòng thử lại');
    } finally {
      setBookingLoading(false);
    }
  }

  async function handleCancelTicket(bookingId: string) {
    if (!window.confirm('Bạn có chắc chắn muốn huỷ vé? Hệ thống sẽ hoàn lại 85% giá vé về ví chính.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await travelBookingService.cancel(bookingId, userId);
      loadMyTickets();
      loadTrips();
    } catch (e: any) {
      alert(e.message || 'Không thể huỷ vé');
    } finally {
      setCancellingId(null);
    }
  }

  function formatTime(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('vi-VN');
    } catch {
      return iso;
    }
  }

  function getTripTypeName(type: TripType) {
    switch (type) {
      case 'BUS':
        return 'Xe khách';
      case 'FLIGHT':
        return 'Máy bay';
      case 'TRAIN':
        return 'Tàu hoả';
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Sub-tabs: Tìm chuyến / Vé của tôi */}
      <div
        style={{
          display: 'flex',
          background: 'var(--el-surface-2)',
          borderRadius: 8,
          padding: 2,
        }}
      >
        <button
          onClick={() => {
            setView('search');
            setSuccessBooking(null);
          }}
          style={{
            flex: 1,
            padding: '6px 0',
            borderRadius: 6,
            border: 0,
            background: view === 'search' ? 'var(--el-surface)' : 'none',
            color: view === 'search' ? 'var(--el-ink)' : 'var(--el-muted)',
            fontWeight: view === 'search' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Tìm vé chuyến đi
        </button>
        <button
          onClick={() => setView('my-tickets')}
          style={{
            flex: 1,
            padding: '6px 0',
            borderRadius: 6,
            border: 0,
            background: view === 'my-tickets' ? 'var(--el-surface)' : 'none',
            color: view === 'my-tickets' ? 'var(--el-ink)' : 'var(--el-muted)',
            fontWeight: view === 'my-tickets' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Vé của tôi
        </button>
      </div>

      {/* Mandatory learning disclaimer */}
      <div
        style={{
          background: 'rgba(234, 179, 8, 0.1)',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 12,
          color: 'var(--el-ink)',
          lineHeight: 1.4,
        }}
      >
        <strong>Lưu ý:</strong> Hệ thống đặt vé du lịch và vé điện tử mô phỏng cho mục đích học tập — không có chuyến bay hay xe khách thật nào được đặt.
      </div>

      {/* VIEW: MY TICKETS */}
      {view === 'my-tickets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ticketsLoading ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--el-muted)' }}>Đang tải danh sách vé...</div>
          ) : myBookings.length === 0 ? (
            <EmptyState
              icon={<Icon name="info" size={32} />}
              title="Chưa có vé điện tử nào"
              description="Bạn chưa đặt vé xe, tàu hay máy bay nào."
            />
          ) : (
            myBookings.map((bk) => (
              <Card key={bk.id} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--el-ink)' }}>
                      {bk.trip ? bk.trip.carrierName : 'Chuyến đi'}
                    </span>
                    {bk.trip && (
                      <span
                        style={{
                          fontSize: 11,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'var(--el-surface-2)',
                          color: 'var(--el-muted)',
                        }}
                      >
                        {getTripTypeName(bk.trip.tripType)}
                      </span>
                    )}
                  </div>
                  <StatusPill tone={bk.status === 'CONFIRMED' ? 'success' : 'neutral'}>
                    {bk.status === 'CONFIRMED' ? 'Đã xác nhận' : 'Đã huỷ & Hoàn tiền'}
                  </StatusPill>
                </div>

                {/* E-Ticket Highlight Box */}
                <div
                  style={{
                    background: 'var(--el-surface-2)',
                    borderRadius: 8,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--el-muted)' }}>Mã đặt chỗ (Booking):</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--el-brand, #2563eb)', letterSpacing: 1 }}>
                      {bk.bookingCode}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--el-muted)' }}>Mã vé (Ticket):</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--el-ink)' }}>{bk.ticketCode}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--el-muted)' }}>Hành khách:</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{bk.passengerName} ({bk.passengerPhone})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--el-muted)' }}>Số ghế:</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--el-brand, #2563eb)' }}>{bk.seatNumber}</span>
                  </div>

                  {bk.trip && (
                    <>
                      <div style={{ borderTop: '1px dashed var(--el-border)', margin: '4px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: 'var(--el-muted)' }}>Tuyến đường:</span>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{bk.trip.origin} ➔ {bk.trip.destination}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: 'var(--el-muted)' }}>Khởi hành:</span>
                        <span style={{ fontSize: 12 }}>{formatTime(bk.trip.departureTime)}</span>
                      </div>
                    </>
                  )}

                  {/* Simulated QR Code for Boarding */}
                  {bk.status === 'CONFIRMED' && (
                    <div
                      style={{
                        marginTop: 6,
                        padding: 8,
                        background: 'var(--el-surface)',
                        borderRadius: 6,
                        border: '1px solid var(--el-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          background: '#000',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: 2,
                          padding: 4,
                          borderRadius: 4,
                        }}
                      >
                        <div style={{ background: '#fff' }} />
                        <div style={{ background: '#000' }} />
                        <div style={{ background: '#fff' }} />
                        <div style={{ background: '#fff' }} />
                        <div style={{ background: '#000' }} />
                        <div style={{ background: '#fff' }} />
                        <div style={{ background: '#000' }} />
                        <div style={{ background: '#fff' }} />
                        <div style={{ background: '#fff' }} />
                        <div style={{ background: '#000' }} />
                        <div style={{ background: '#fff' }} />
                        <div style={{ background: '#000' }} />
                        <div style={{ background: '#fff' }} />
                        <div style={{ background: '#fff' }} />
                        <div style={{ background: '#000' }} />
                        <div style={{ background: '#fff' }} />
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--el-muted)', lineHeight: 1.3 }}>
                        <strong>Mã QR vé điện tử</strong>
                        <div>Quét tại quầy làm thủ tục trước khi lên xe/bay</div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--el-brand, #2563eb)' }}>
                    {formatVnd(bk.totalAmount)}
                  </div>

                  {bk.status === 'CONFIRMED' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={cancellingId === bk.id}
                      onClick={() => handleCancelTicket(bk.id)}
                    >
                      {cancellingId === bk.id ? 'Đang huỷ...' : 'Huỷ vé (Hoàn 85%)'}
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* VIEW: SEARCH & BOOKING */}
      {view === 'search' && !successBooking && !selectedTrip && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Transport Type Pills */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { label: 'Tất cả', value: undefined },
              { label: '🚌 Xe khách', value: 'BUS' as TripType },
              { label: '✈️ Máy bay', value: 'FLIGHT' as TripType },
              { label: '🚆 Tàu hoả', value: 'TRAIN' as TripType },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => setTripType(p.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 16,
                  border: '1px solid var(--el-border)',
                  background: tripType === p.value ? 'var(--el-ink)' : 'var(--el-surface)',
                  color: tripType === p.value ? 'var(--el-surface)' : 'var(--el-ink)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Search Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <TextField
              label="Điểm đi"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Vd: Hà Nội"
            />
            <TextField
              label="Điểm đến"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Vd: TP. Hồ Chí Minh"
            />
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <TextField
                label="Ngày đi"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <Button variant="primary" onClick={loadTrips} disabled={loading} style={{ height: 42 }}>
              {loading ? 'Đang tìm...' : 'Tìm chuyến'}
            </Button>
          </div>

          {error && <div style={{ color: 'var(--el-danger)', fontSize: 13 }}>{error}</div>}

          {/* Trips Result List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--el-muted)' }}>
              Danh sách chuyến đi ({trips.length})
            </div>

            {trips.length === 0 && !loading && (
              <EmptyState
                icon={<Icon name="info" size={32} />}
                title="Không tìm thấy chuyến đi"
                description="Thử thay đổi điểm đi, điểm đến hoặc chọn loại phương tiện khác."
              />
            )}

            {trips.map((trip) => (
              <Card
                key={trip.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: 14,
                  border: '1px solid var(--el-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 15 }}>{trip.carrierName}</span>
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: 'var(--el-surface-2)',
                      }}
                    >
                      {getTripTypeName(trip.tripType)}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--el-brand, #2563eb)' }}>
                    {formatVnd(trip.price)}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{trip.origin} ➔ {trip.destination}</div>
                    <div style={{ color: 'var(--el-muted)', fontSize: 12 }}>
                      Khởi hành: {formatTime(trip.departureTime)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: trip.availableSeats <= 3 ? 'var(--el-danger)' : 'var(--el-success)',
                      }}
                    >
                      Còn {trip.availableSeats} / {trip.totalSeats} ghế
                    </div>
                    <div style={{ color: 'var(--el-muted)', fontSize: 11 }}>Đến: {formatTime(trip.arrivalTime)}</div>
                  </div>
                </div>

                <div style={{ marginTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={trip.availableSeats <= 0}
                    onClick={() => {
                      setSelectedTrip(trip);
                      setPassengerName('');
                      setPassengerPhone('');
                      setSeatNumber('');
                      setBookingError(null);
                    }}
                  >
                    {trip.availableSeats > 0 ? 'Chọn vé' : 'Hết vé'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MODAL / VIEW: BOOKING PASSENGER FORM */}
      {view === 'search' && selectedTrip && !successBooking && (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Thông tin hành khách & Đặt vé</h3>
            <button
              onClick={() => setSelectedTrip(null)}
              style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--el-muted)' }}
            >
              ✕ Đóng
            </button>
          </div>

          <div
            style={{
              background: 'var(--el-surface-2)',
              borderRadius: 8,
              padding: 10,
              fontSize: 13,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div><strong>Hãng:</strong> {selectedTrip.carrierName} ({getTripTypeName(selectedTrip.tripType)})</div>
            <div><strong>Tuyến:</strong> {selectedTrip.origin} ➔ {selectedTrip.destination}</div>
            <div><strong>Khởi hành:</strong> {formatTime(selectedTrip.departureTime)}</div>
            <div><strong>Giá vé:</strong> <span style={{ fontWeight: 700, color: 'var(--el-brand, #2563eb)' }}>{formatVnd(selectedTrip.price)}</span></div>
          </div>

          <TextField
            label="Họ và tên hành khách *"
            value={passengerName}
            onChange={(e) => setPassengerName(e.target.value)}
            placeholder="Vd: Nguyễn Văn A"
          />

          <TextField
            label="Số điện thoại liên hệ *"
            value={passengerPhone}
            onChange={(e) => setPassengerPhone(e.target.value)}
            placeholder="Vd: 0987654321"
          />

          <TextField
            label="Số ghế mong muốn (tuỳ chọn)"
            value={seatNumber}
            onChange={(e) => setSeatNumber(e.target.value)}
            placeholder="Vd: A12, 14B..."
          />

          <div style={{ fontSize: 12, color: 'var(--el-muted)' }}>
            Tiền vé sẽ được trừ trực tiếp từ <strong>Ví chính</strong> của bạn.
          </div>

          {bookingError && <div style={{ color: 'var(--el-danger)', fontSize: 13 }}>{bookingError}</div>}

          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <Button variant="secondary" onClick={() => setSelectedTrip(null)} style={{ flex: 1 }}>
              Quay lại
            </Button>
            <Button
              variant="primary"
              onClick={handleBookTicket}
              disabled={bookingLoading}
              style={{ flex: 2 }}
            >
              {bookingLoading ? 'Đang thanh toán...' : `Thanh toán ${formatVnd(selectedTrip.price)}`}
            </Button>
          </div>
        </Card>
      )}

      {/* VIEW: BOOKING SUCCESS E-TICKET RECEIPT */}
      {view === 'search' && successBooking && (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--el-success)' }}>
              Đặt vé thành công!
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--el-muted)' }}>
              Vé điện tử đã được phát hành và lưu trong mục "Vé của tôi".
            </p>
          </div>

          <div
            style={{
              background: 'var(--el-surface-2)',
              borderRadius: 8,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--el-muted)' }}>Mã đặt chỗ:</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--el-brand, #2563eb)', letterSpacing: 1 }}>
                {successBooking.bookingCode}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--el-muted)' }}>Mã vé:</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{successBooking.ticketCode}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--el-muted)' }}>Hành khách:</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{successBooking.passengerName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--el-muted)' }}>Số ghế:</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--el-brand, #2563eb)' }}>
                {successBooking.seatNumber}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--el-muted)' }}>Tổng thanh toán:</span>
              <span style={{ fontSize: 14, fontWeight: 800 }}>{formatVnd(successBooking.totalAmount)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant="secondary"
              onClick={() => {
                setSuccessBooking(null);
                loadTrips();
              }}
              style={{ flex: 1 }}
            >
              Đặt chuyến khác
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setSuccessBooking(null);
                setView('my-tickets');
              }}
              style={{ flex: 1 }}
            >
              Xem vé của tôi
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
