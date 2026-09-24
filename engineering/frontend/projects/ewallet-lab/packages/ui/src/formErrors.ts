/**
 * Central place for turning HTTP failures into the "precise reason + how to
 * fix it" copy MoMo's own UX guideline calls for, instead of a generic
 * "Something went wrong."
 */
export function describeApiError(
  status: number | undefined,
  context:
    | 'phone'
    | 'register'
    | 'link-bank'
    | 'topup'
    | 'withdraw'
    | 'transfer'
    | 'bank-transfer-out'
    | 'bill-payment'
    | 'payment-link'
    | 'payment-reminder'
    | 'lucky-money',
): string {
  if (status === undefined) {
    return 'Không kết nối được tới máy chủ. Kiểm tra lại các service đã chạy chưa rồi thử lại.';
  }
  if (status === 409) {
    if (context === 'register') return 'Số điện thoại này đã đăng ký. Thử đăng nhập lại.';
    if (context === 'topup') return 'Số dư không đủ hoặc giao dịch trùng lặp.';
    if (context === 'withdraw') return 'Số dư không đủ để rút.';
    if (context === 'transfer') return 'Số dư không đủ để chuyển.';
    if (context === 'bank-transfer-out') return 'Số dư không đủ để chuyển khoản.';
    if (context === 'bill-payment') return 'Số dư không đủ để thanh toán hoá đơn.';
    if (context === 'payment-link' || context === 'payment-reminder') {
      return 'Yêu cầu này không còn ở trạng thái chờ thanh toán (đã trả, đã huỷ, đã hết hạn, hoặc số dư không đủ).';
    }
    if (context === 'lucky-money') {
      return 'Số dư không đủ để gửi lì xì, hoặc lì xì này đã được nhận/đã hết hạn rồi.';
    }
  }
  if (status === 400 && context === 'withdraw') {
    return 'Chưa liên kết tài khoản ngân hàng.';
  }
  if (
    status === 400 &&
    (context === 'transfer' || context === 'payment-link' || context === 'payment-reminder' || context === 'lucky-money')
  ) {
    return 'Không thể tự thanh toán/tự nhắc/tự gửi lì xì cho chính mình.';
  }
  if (status === 403 && (context === 'payment-link' || context === 'payment-reminder' || context === 'lucky-money')) {
    return 'Bạn không có quyền thực hiện thao tác này trên yêu cầu.';
  }
  if (status === 404) {
    if (context === 'phone') return 'Chưa tìm thấy tài khoản với số điện thoại này.';
    if (context === 'transfer') return 'Không tìm thấy người nhận với số điện thoại này.';
    if (context === 'payment-link') return 'Không tìm thấy link nhận tiền này.';
    if (context === 'payment-reminder') return 'Không tìm thấy người dùng hoặc lời nhắc này.';
    if (context === 'lucky-money') {
      return 'Không tìm thấy người dùng Ewallet Lab với số điện thoại này (lab không hỗ trợ mời SMS cho SĐT chưa có tài khoản), hoặc không tìm thấy lì xì này.';
    }
  }
  if (status === 400) {
    return 'Thông tin nhập chưa hợp lệ. Kiểm tra lại các trường bên trên.';
  }
  if (status >= 500) {
    return 'Máy chủ đang gặp sự cố. Thử lại sau ít phút.';
  }
  return `Yêu cầu thất bại (mã lỗi ${status}). Thử lại sau.`;
}
