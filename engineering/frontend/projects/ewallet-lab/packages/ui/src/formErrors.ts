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
    | 'lucky-money'
    | 'bnpl-open'
    | 'bnpl-draw'
    | 'bnpl-repay'
    | 'loyalty-redeem'
    | 'savings-pocket'
    | 'family-wallet'
    | 'auto-debit'
    | 'investment-buy'
    | 'investment-sell'
    | 'savings-goal'
    | 'voucher-pass',
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
    if (context === 'savings-pocket') {
      return 'Số dư không đủ, hoặc Túi Thần Tài đã được mở trước đó, hoặc số tiền mở lần đầu chưa đạt tối thiểu.';
    }
    if (context === 'family-wallet') {
      return 'Thành viên này đã thuộc về một Ví Gia Đình khác (mỗi thành viên chỉ thuộc 1 gia đình).';
    }
    if (context === 'savings-goal') {
      return 'Số dư không đủ (ví chính hoặc mục tiêu), hoặc mục tiêu tiết kiệm đã kết thúc/huỷ.';
    }
    if (context === 'voucher-pass') {
      return 'Số dư ví chính không đủ để mua gói, hoặc voucher đã được sử dụng/hết hạn.';
    }
  }
  if (status === 409) {
    if (context === 'bnpl-open') return 'Ví Trả Sau (mô phỏng) đã được mở cho tài khoản này rồi.';
    if (context === 'bnpl-draw') return 'Số tiền vượt hạn mức khả dụng của Ví Trả Sau.';
    if (context === 'bnpl-repay') {
      return 'Ví chính không đủ số dư để trả nợ (hoặc Ví Trả Sau không còn dư nợ). Nạp thêm tiền vào ví chính rồi thử lại.';
    }
  }
  if (status === 409 && context === 'loyalty-redeem') {
    return 'Không đủ điểm để đổi số điểm này.';
  }
  if (status === 409 && context === 'investment-buy') {
    return 'Số dư ví chính không đủ để thực hiện lệnh mua chứng chỉ quỹ, hoặc vượt hạn mức chi tiêu tháng.';
  }
  if (status === 409 && context === 'investment-sell') {
    return 'Số lượng chứng chỉ quỹ nắm giữ không đủ để bán.';
  }
  if (status === 409 && context === 'auto-debit') {
    return 'Uỷ quyền thanh toán tự động cho hoá đơn này đã tồn tại.';
  }
  if (status === 400 && context === 'investment-buy') {
    return 'Cần đọc và xác nhận 4 điều khoản cảnh báo rủi ro thị trường trước khi đặt lệnh mua, hoặc số tiền mua chưa đạt tối thiểu 10.000đ.';
  }
  if (status === 400 && context === 'investment-sell') {
    return 'Số lượng chứng chỉ quỹ bán không hợp lệ.';
  }
  if (status === 400 && context === 'loyalty-redeem') {
    return 'Số điểm đổi chưa đạt mức tối thiểu.';
  }
  if (status === 502 && context === 'loyalty-redeem') {
    return 'Chưa cộng được tiền vào ví chính — điểm đã được hoàn lại, thử lại sau.';
  }
  if (status === 400 && context === 'bnpl-open') {
    return 'Cần đọc và xác nhận điều khoản mô phỏng trước khi mở Ví Trả Sau.';
  }
  if (status === 400 && context === 'bnpl-draw') {
    return 'Số tiền phải là số nguyên, tối thiểu 1.000đ.';
  }
  if (status === 400 && context === 'bnpl-repay') {
    return 'Số tiền trả phải là số nguyên dương và không vượt quá tổng dư nợ hiện tại.';
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
  if (status === 400 && context === 'family-wallet') {
    return 'Không thể đặt hạn mức cho chính mình.';
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
    if (context === 'savings-pocket') {
      return 'Chưa mở Túi Thần Tài.';
    }
    if (context === 'family-wallet') {
      return 'Không tìm thấy tài khoản Ewallet Lab với số điện thoại này.';
    }
    if (context === 'savings-goal') {
      return 'Không tìm thấy mục tiêu tiết kiệm này.';
    }
  }
  if (status === 428 && context === 'savings-goal') {
    return 'Giao dịch trên 10.000.000đ cần xác thực sinh trắc học / OTP nâng cao (QĐ 2345/TT 40).';
  }
  if (status === 400 && context === 'voucher-pass') {
    return 'Hoá đơn chưa đạt giá trị tối thiểu hoặc voucher không áp dụng cho danh mục này.';
  }
  if (status === 400) {
    return 'Thông tin nhập chưa hợp lệ. Kiểm tra lại các trường bên trên.';
  }
  if (status >= 500) {
    return 'Máy chủ đang gặp sự cố. Thử lại sau ít phút.';
  }
  return `Yêu cầu thất bại (mã lỗi ${status}). Thử lại sau.`;
}
