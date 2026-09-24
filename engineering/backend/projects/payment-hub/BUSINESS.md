# Payment Hub — Business Context

[`DESIGN.md`](DESIGN.md) trả lời "hệ thống được xây thế nào" (tech). File này trả lời "vì sao xây
như vậy" (business) — mỗi mục đều trỏ ngược lại đúng file code đã implement, để không học lý thuyết
suông.

## 1. Vì sao ngân hàng cần Payment Hub

Không có payment hub, mỗi lần core banking muốn tích hợp 1 rail mới (NAPAS, SWIFT, ví điện tử,
Visa/Mastercard...) phải sửa trực tiếp vào core banking — rủi ro cao, khó test, không tái sử dụng.
Payment hub tách lớp điều phối ra khỏi core banking, business value cụ thể:

- **Giảm chi phí tích hợp**: core banking chỉ cần biết 1 API (`POST /payments`), không cần biết
  NAPAS/SWIFT khác nhau thế nào — đó chính là việc `orchestrator` + `RoutingEngine` làm.
- **Kiểm soát rủi ro tập trung**: 1 điểm bắt buộc đi qua sanctions screening
  (`compliance-service`) trước khi tiền rời khỏi ngân hàng — không phải team nào tích hợp rail mới
  cũng tự nhớ thêm bước này.
- **Audit/đối soát tập trung**: 1 nguồn sự thật (`ledger-service`) cho mọi giao dịch bất kể qua
  rail nào — thay vì mỗi rail tự ghi sổ theo cách riêng.

## 2. Business flow theo từng trạng thái (map state → ý nghĩa thật)

| Trạng thái (`TransactionStatus`) | Ý nghĩa business | Ai quan tâm |
|---|---|---|
| `SCREENING` | Đang kiểm tra danh sách trừng phạt (OFAC/UN) — **bắt buộc theo luật**, không phải tuỳ chọn kỹ thuật | Compliance/AML officer |
| `REJECTED` | Giao dịch bị chặn do nghi ngờ rửa tiền/tài trợ khủng bố — ngân hàng có nghĩa vụ báo cáo (STR — Suspicious Transaction Report) | Compliance, cơ quan quản lý (SBV) |
| `ROUTED` | Tiền đã "rời khỏi" góc nhìn ngân hàng gửi, nhưng **chưa chắc đã tới nơi** — đây là điểm hay bị hiểu sai nhất trong nghiệp vụ thanh toán | Khách hàng (hay hỏi "sao tiền chưa tới"), Ops |
| `SETTLED` | Tiền đã thực sự tới, đối tác xác nhận — chỉ lúc này mới được coi là hoàn tất | Khách hàng, Kế toán/Finance |
| `FAILED` | Rail từ chối (tài khoản không tồn tại, ngân hàng đích down, correspondent bank từ chối...) — cần hoàn tiền (refund) | Ops, khách hàng |
| `REVERSED` | Đã hoàn tiền — `ledger-service.reverse()` ghi compensating entry, không xoá bản ghi gốc | Kế toán, kiểm toán nội bộ |

## 3. Business rule đã code: ngưỡng NAPAS vs IBPS

`RoutingEngine.NAPAS_CEILING_VND = 500,000,000 VND` — đây **không phải** con số bịa cho lab. Trong
thực tế, NAPAS chỉ xử lý thanh toán liên ngân hàng dưới 500 triệu VND; giao dịch VND giá trị lớn hơn
phải qua **IBPS — Inter-bank (Electronic) Payment System, tên chính thức trên trang SBV, còn gọi là
CITAD (Citizen/Centralized Interbank Transfer Accounting & Dispatch) trong tài liệu cũ** — hệ thống
thanh toán giá trị cao do chính Ngân hàng Nhà nước (SBV) vận hành trực tiếp, tách biệt hoàn toàn với
NAPAS (NAPAS là công ty cổ phần được SBV **cấp phép** vận hành dịch vụ chuyển mạch tài chính +
chuyển mạch bù trừ điện tử — không phải cơ quan nhà nước). Lab này **không** implement IBPS adapter
(ngoài scope), nhưng `RoutingEngine` throw exception rõ ràng khi vượt ngưỡng thay vì âm thầm route
sai — phản ánh đúng ranh giới hệ thống thật.

**Bài học kinh doanh ở đây**: một quyết định routing không chỉ là kỹ thuật (BIC có hay không) mà
còn là **ranh giới quy định** (regulatory boundary) — quyết định sai không chỉ là bug, mà có thể là
vi phạm quy định thanh toán quốc gia.

## 4. Cross-border: rủi ro & kinh tế của correspondent banking

`swift-adapter` giả lập gọi "correspondent bank" — đây là khái niệm cốt lõi cần hiểu:

- **Nostro/Vostro account**: khi ngân hàng A muốn chuyển USD ra nước ngoài, A phải có tài khoản
  **Nostro** ("tài khoản của chúng tôi tại ngân hàng bạn") mở tại 1 ngân hàng correspondent ở Mỹ.
  Từ góc nhìn ngân hàng Mỹ đó, đây là tài khoản **Vostro** ("tài khoản của bạn tại chúng tôi"). Tiền
  **không** thực sự "bay" xuyên biên giới — 2 ngân hàng chỉ ghi nợ/có trên sổ nội bộ của chính mình.
- **Pre-funding & chi phí vốn**: ngân hàng phải **giữ sẵn tiền** trong tài khoản Nostro ở mọi
  currency corridor mình phục vụ — tiền này gần như không sinh lãi (ước tính toàn ngành: hàng trăm
  tỷ đến hơn 1 nghìn tỷ USD bị "giam" theo cách này toàn cầu). Đây là lý do cross-border luôn có phí
  cao hơn domestic — không phải ngân hàng "chặt chém", mà là chi phí vốn thật.
- **Settlement risk cao hơn NAPAS hẳn**: `SimulateCorrespondentSettlement` trong `swift-adapter`
  cố tình mô phỏng độ trễ dài hơn (2–6s so với NAPAS 0.5–2s) và tỷ lệ fail cao hơn (~10% so với ~5%)
  — phản ánh đúng thực tế: nhiều bên trung gian hơn = nhiều điểm fail hơn, thanh khoản Nostro không
  đủ ở 1 mắt xích nào đó có thể làm cả chuỗi settlement chậm lại.

## 5. Kinh tế mạng lưới thẻ: interchange fee & vì sao Visa/Mastercard không "chuyển tiền"

`visa-adapter`/`mastercard-adapter` giả lập **authorization**, không phải "chuyển tiền" theo nghĩa
NAPAS/SWIFT làm — đây là khác biệt mô hình kinh doanh quan trọng nhất cần hiểu:

- **Visa/Mastercard không giữ tài khoản khách hàng, không phải ngân hàng**: họ vận hành **mạng lưới**
  (VisaNet, Banknet) kết nối **Issuer** (ngân hàng phát hành thẻ, giữ tài khoản chủ thẻ) với
  **Acquirer** (ngân hàng của merchant, nhận tiền thay merchant). Trong lab, `destAccount` là PAN
  (số thẻ) — về bản chất đại diện cho **issuer** của thẻ đó, không phải 1 "tài khoản ngân hàng" như
  NAPAS/SWIFT.
- **Interchange fee**: mỗi giao dịch thẻ, acquirer trả cho issuer 1 khoản phí (thường 1–3% giá trị
  giao dịch, do network quy định) — đây là nguồn thu chính của issuer trong hệ sinh thái thẻ, và là
  lý do các ngân hàng phát hành thẻ tích cực khuyến khích chi tiêu bằng thẻ. Visa/Mastercard thu phí
  network riêng (nhỏ hơn interchange) cho việc vận hành mạng lưới.
- **3 giai đoạn tách biệt** (lab chỉ mô phỏng giai đoạn 1):
  1. **Authorization** (real-time, giữ tiền — `SimulateAuthorization` trong lab)
  2. **Clearing** (network tổng hợp giao dịch giữa các issuer/acquirer, thường theo batch)
  3. **Settlement** (tiền thực sự chuyển giữa issuer và acquirer qua network, T+1/T+2)
- **Stand-In Processing (STIP)** — `mastercard-adapter` mô phỏng: khi issuer không phản hồi kịp,
  network **tự quyết định thay issuer** dựa theo floor limit đã thoả thuận trước. Đây là lý do card
  network có uptime cảm nhận cao hơn nhiều so với gọi trực tiếp issuer — network hấp thụ rủi ro
  downtime của issuer bằng rule đã định sẵn, không phải "đoán mò".

**Bài học kinh doanh**: khi thấy `destAccount` là 1 dãy số 16 chữ số bắt đầu bằng "4", đừng nghĩ đó
là "tài khoản ngân hàng của người nhận" như NAPAS — nó là danh tính của **issuer** trong 1 mạng lưới
authorization, và tiền thật sự di chuyển sau đó, tách rời cả về thời gian lẫn cơ chế.

## 6. Ví điện tử: vai trò trung gian, 2 partner thật (MoMo, ZaloPay) & quy định liên quan

`momo-adapter`/`zalopay-adapter` giả lập disbursement tới 1 ví (định danh bằng số điện thoại) —
khác NAPAS/SWIFT/card ở chỗ **ví điện tử không phải rail cấp quốc gia**, mà là **dịch vụ trung gian
thanh toán (IPS)** do công ty tư nhân cung cấp, được SBV cấp phép theo Nghị định 52/2024/NĐ-CP.

- **Ví điện tử thường không "chuyển tiền" độc lập** — phía sau, ví phải liên kết với 1 tài khoản
  ngân hàng hoặc thẻ để nạp/rút, nên bản thân ví thường **không phải điểm cuối** của dòng tiền, mà
  là 1 lớp trung gian thêm giữa người dùng và hệ thống ngân hàng.
- **1 số điện thoại không xác định được duy nhất 1 ví** — khác thẻ (BIN xác định network duy nhất),
  người dùng có thể có cả MoMo lẫn ZaloPay trên cùng số điện thoại. `RoutingEngine` bắt buộc client
  phải chỉ định `walletProvider` tường minh — đây là hệ quả trực tiếp của việc thị trường ví điện tử
  VN có nhiều provider cạnh tranh, không có 1 wallet ID không gian tên duy nhất như card BIN.
- **MoMo và ZaloPay có quy ước kỹ thuật khác nhau dù cùng mục đích** — ví dụ công thức chữ ký: MoMo
  sắp field theo alphabet trước khi HMAC, ZaloPay theo đúng thứ tự tài liệu liệt kê (không phải
  alphabet). Nhầm giữa 2 quy ước là lỗi tích hợp thực tế phổ biến khi 1 đội ngũ phải tích hợp cả
  2 provider cùng lúc — đây chính là lý do 2 adapter được implement tách biệt hoàn toàn, không dùng
  chung 1 module "ewallet" chung chung.
- **Circular 41/2025/TT-NHNN** (đã nêu ở mục 7): từ 2026, chủ ví dùng CCCD/định danh điện tử phải
  xác thực sinh trắc học — phản ánh lo ngại thực tế: ví điện tử từng là kênh dễ bị lợi dụng để rửa
  tiền/lừa đảo hơn tài khoản ngân hàng truyền thống do KYC lỏng hơn ở giai đoạn đầu thị trường.
- **IPN (Instant Payment Notification)**: khác NAPAS/SWIFT/card (đều có phản hồi đồng bộ hoặc
  gần-đồng-bộ), xác nhận giao dịch ví điện tử thực tế đến qua **webhook bất đồng bộ** provider gọi
  ngược lại hệ thống merchant/ngân hàng — đây là lý do nhiều lỗi thực tế trong tích hợp ví điện tử
  đến từ việc xử lý sai thứ tự/trùng lặp webhook, không phải lỗi ở bước gọi API ban đầu.

## 7. Khung pháp lý áp dụng — bảng mapping đầy đủ (cập nhật 2026-09-21)

Nguyên tắc của bảng này: nói thật mức độ cover, **không tô hồng**. Nhiều quy định không áp dụng
được vì lab không có kênh/nghiệp vụ tương ứng (không có mobile app, không có mở tài khoản/phát hành
thẻ/mở ví) — ghi rõ "Ngoài scope" thay vì giả vờ đã cover.

| Quy định | Nội dung chính | Mức độ cover trong lab | Vì sao |
|---|---|---|---|
| **Nghị định 52/2024/NĐ-CP** (hiệu lực 1/7/2024, thay Nghị định 101/2012) | Khung pháp lý gốc cho thanh toán không dùng tiền mặt; định nghĩa lần đầu về e-money; định nghĩa **IPS (Intermediary Payment Service) provider** cần SBV cấp phép — gồm dịch vụ chuyển mạch tài chính, chuyển mạch bù trừ điện tử (chính là vai trò NAPAS đang giữ), ví điện tử, cổng thanh toán | **Cover khái niệm** | `napas-adapter`, `momo-adapter`, `zalopay-adapter` mô phỏng đúng vai trò IPS provider theo định nghĩa Nghị định 52 (chuyển mạch+bù trừ vs ví điện tử) — field/chữ ký của 2 adapter ví điện tử xác minh từ tài liệu thật của MoMo/ZaloPay, không phải suy đoán |
| **Visa/Mastercard là card scheme quốc tế, KHÔNG phải IPS provider trong nước** | Vận hành theo thoả thuận riêng với ngân hàng issuer/acquirer tại VN (qua SBV cấp phép hoạt động thẻ cho ngân hàng, không phải cấp phép trực tiếp cho Visa/Mastercard) — khung pháp lý khác hẳn NAPAS/ví điện tử | **Cover khái niệm** | `visa-adapter`/`mastercard-adapter` cố tình tách khỏi khái niệm "IPS provider" ở trên — xem mục 5 để hiểu vì sao mô hình kinh doanh (issuer/acquirer/interchange) khác hẳn |
| **Ngưỡng NAPAS 500 triệu VND → IBPS** | Xem mục 3 | **Cover bằng code** | `RoutingEngine.NAPAS_CEILING_VND`, throw exception khi vượt ngưỡng |
| **Luật Phòng, chống rửa tiền 2022** (hiệu lực 3/2023) + **Circular 27/2025/TT-NHNN** (15/9/2025) | Nghĩa vụ AML, siết tiêu chí rủi ro, **bắt buộc báo cáo điện tử từ 1/1/2026** cho electronic funds transfer | **Cover vị trí quy trình** | `compliance-service` chạy **trước** routing (bước 3/8) — đúng vị trí luật yêu cầu. Bản thân nội dung screening chỉ là blocklist hardcode, không phải hệ thống AML thật |
| **FATF Recommendations** + **OFAC/UN sanctions list** | Chuẩn quốc tế yêu cầu sanctions screening trước chuyển tiền quốc tế | **Cover vị trí quy trình, không cover nội dung** | Screening chạy cho cả NAPAS lẫn SWIFT trong lab (thực tế OFAC chủ yếu áp lực với USD/cross-border, nhưng domestic AML vẫn cần theo luật VN) |
| **SIMO** (Hệ thống hỗ trợ giám sát, phòng chống gian lận — SBV, đã triển khai cho 149 tổ chức tính đến 3/2026, gồm 99 TCTD + 50 trung gian thanh toán) | Hệ thống chia sẻ thông tin gian lận **liên ngân hàng** ở cấp quốc gia | **Không cover** — chỉ ghi nhận vị trí tương đương | `compliance-service` trong lab là bản thu nhỏ **1 ngân hàng tự làm**, không kết nối/chia sẻ dữ liệu liên ngân hàng như SIMO thật. Nếu triển khai thật, đây là hạng mục tích hợp riêng với SBV, không tự code được |
| **Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân** + **Luật Bảo vệ Dữ liệu Cá nhân** (hiệu lực 1/1/2026, nâng cấp từ nghị định lên luật) | Số tài khoản/thông tin tiền gửi là dữ liệu cá nhân được bảo vệ; yêu cầu tối thiểu hoá dữ liệu; thông báo vi phạm trong 72 giờ | **Cover một phần** | Đã fix: log lộ số tài khoản dạng plaintext ở cả happy-path lẫn error-path trong `ledger-service` (`RoutingEventListener`) — giờ mask qua `PiiMasking.maskAccount()`. **Chưa cover**: mã hoá dữ liệu tại rest (Postgres lưu plaintext), quy trình xử lý yêu cầu xoá/truy xuất dữ liệu của khách hàng, quy trình thông báo vi phạm 72h |
| **Circular 45/2025/TT-NHNN** (hiệu lực 5/1/2026) | Bắt buộc xác thực sinh trắc học khi mở tài khoản/phát hành thẻ | **Ngoài scope** — dù `visa-adapter`/`mastercard-adapter` đã mô phỏng **giao dịch** bằng thẻ | Yêu cầu này áp dụng ở bước **phát hành thẻ** (account/card onboarding), không phải bước **xử lý giao dịch** mà 2 adapter này mô phỏng — `payment-hub` giả định thẻ đã tồn tại và hợp lệ sẵn khi tới `POST /payments` |
| **Circular 41/2025/TT-NHNN** | Xác thực sinh trắc học cho chủ ví điện tử (căn cước/định danh điện tử) | **Ngoài scope** — dù `momo-adapter`/`zalopay-adapter` đã mô phỏng **giao dịch** ví điện tử | Cùng lý do như Circular 45: yêu cầu áp dụng ở bước **mở/xác minh ví**, không phải bước **disbursement** mà 2 adapter này mô phỏng |
| **Circular 77/2025/TT-NHNN** (hiệu lực 1/3/2026) | Ứng dụng mobile banking bắt buộc chống giả mạo (anti-tampering), Presentation Attack Detection đạt chuẩn ISO 30107 Level 2 | **Ngoài scope** | Lab không có mobile app — `POST /payments` là API nội bộ, không phải kênh khách hàng trực tiếp |
| **Dự thảo Circular về ứng dụng AI trong ngân hàng** (dự kiến trình Thống đốc SBV Q3/2026) | Khung quản trị rủi ro khi triển khai AI trong nghiệp vụ ngân hàng | **Chưa áp dụng** | Còn là dự thảo, chưa ban hành; lab cũng không dùng AI trong quyết định routing/screening |

**Kết luận thành thật**: lab cover tốt phần **vị trí quy trình** (compliance chạy trước routing,
đúng ranh giới NAPAS/IBPS, ghi log tối thiểu hoá dữ liệu) — đây là phần quan trọng nhất để hiểu
kiến trúc. Lab **không** và **không nên giả vờ** cover phần nội dung nghiệp vụ sâu (screening list
thật, mã hoá dữ liệu tại rest, tích hợp SIMO, xác thực sinh trắc học) — những phần này cần review
pháp lý + đầu tư hạ tầng riêng, không thể tự suy luận từ hiểu biết kỹ thuật thuần tuý.

## 8. KPI nghiệp vụ thường dùng để đo hệ thống thanh toán

Đây là các chỉ số một Payment Ops/Business team thật sẽ theo dõi — lab hiện **chưa** có dashboard đo
những cái này, nhưng dữ liệu để tính đã có sẵn trong `ledger-service`/`orchestrator`'s Postgres:

| KPI | Ý nghĩa | Cách tính từ dữ liệu lab |
|---|---|---|
| **STP rate** (Straight-Through Processing) | % giao dịch xử lý hoàn toàn tự động, không cần can thiệp thủ công | `SETTLED / (SETTLED + FAILED + REJECTED)` |
| **Settlement time** | Thời gian từ `ROUTED` đến `SETTLED` | `updated_at - created_at` khi status chuyển sang SETTLED |
| **Failure rate theo rail** | NAPAS vs SWIFT có tỷ lệ fail khác biệt bao nhiêu | Đếm `FAILED` theo `rail_type` |
| **Reconciliation break rate** | % giao dịch có ledger entry không khớp trạng thái orchestrator | So sánh `transactions.status` (orchestrator DB) với `ledger_entries.status` (ledger DB) — 2 DB tách biệt nên **có thể lệch nhau thật**, đúng vấn đề "reconciliation" trong sách Microservices Interview đã ôn (Q&A 3.74) |

## 9. Glossary thuật ngữ business

- **Clearing vs Settlement**: Clearing = xác định nghĩa vụ ai nợ ai bao nhiêu (NAPAS làm việc này).
  Settlement = tiền thực sự chuyển (bước sau clearing, có thể tách rời về thời gian).
- **Correspondent bank**: ngân hàng trung gian giữ tài khoản Nostro/Vostro cho ngân hàng khác ở thị
  trường mà ngân hàng đó không có mặt trực tiếp.
- **BIC/SWIFT code**: mã định danh ngân hàng theo chuẩn ISO 9362, dùng để route message SWIFT tới
  đúng ngân hàng (`destBic` trong `PaymentRequest`).
- **UETR** (Unique End-to-end Transaction Reference): mã theo dõi xuyên suốt 1 giao dịch SWIFT qua
  mọi ngân hàng trung gian — tương đương "correlation ID" mà sách Microservices Interview đã dạy
  (Q&A 3.21), chỉ khác là UETR là chuẩn ngành, không phải tự nghĩ ra.
- **STR** (Suspicious Transaction Report): báo cáo bắt buộc gửi cơ quan quản lý khi phát hiện giao
  dịch đáng ngờ — hệ quả trực tiếp của trạng thái `REJECTED`.
- **IPS provider** (Intermediary Payment Service provider): tổ chức phi ngân hàng được SBV cấp phép
  cung cấp dịch vụ trung gian thanh toán (chuyển mạch tài chính, bù trừ điện tử, ví điện tử, cổng
  thanh toán) theo Nghị định 52/2024/NĐ-CP — NAPAS là 1 IPS provider, không phải cơ quan nhà nước.
- **SIMO**: hệ thống quốc gia của SBV hỗ trợ giám sát/phòng chống gian lận, kết nối chia sẻ dữ liệu
  giữa nhiều tổ chức tín dụng + trung gian thanh toán — khác về bản chất với 1 `compliance-service`
  tự làm trong nội bộ 1 ngân hàng (không chia sẻ dữ liệu liên ngân hàng).
- **PDPL** (Personal Data Protection Law, hiệu lực 1/1/2026): luật bảo vệ dữ liệu cá nhân Việt Nam,
  nâng cấp từ Nghị định 13/2023/NĐ-CP lên cấp luật — số tài khoản/thông tin tiền gửi nằm trong phạm
  vi bảo vệ.
- **Issuer / Acquirer**: Issuer = ngân hàng phát hành thẻ, giữ tài khoản/hạn mức của chủ thẻ.
  Acquirer = ngân hàng phục vụ merchant, nhận tiền thay merchant. Visa/Mastercard là mạng lưới kết
  nối 2 bên này, không phải 1 trong 2.
- **Interchange fee**: phí acquirer trả cho issuer trên mỗi giao dịch thẻ (thường 1–3%, do network
  quy định) — nguồn thu chính của issuer, khác với phí network (Visa/Mastercard thu riêng, nhỏ hơn).
- **BIN** (Bank Identification Number): 6–8 chữ số đầu của PAN, xác định issuer + network (Visa bắt
  đầu "4", Mastercard "51–55"/"2221–2720") — theo chuẩn ISO/IEC 7812, dùng để routing trong
  `RoutingEngine`.
- **STIP** (Stand-In Processing): cơ chế của Mastercard tự quyết định thay issuer khi issuer không
  phản hồi kịp, dựa theo rule đã thoả thuận trước (floor limit) — không phải "timeout thì fail" đơn
  thuần, mà là fallback có logic quyết định thật.
- **IPN** (Instant Payment Notification): callback bất đồng bộ mà provider ví điện tử gọi ngược lại
  hệ thống merchant/ngân hàng để xác nhận giao dịch — khác mô hình request/response đồng bộ của
  NAPAS/SWIFT/card.
