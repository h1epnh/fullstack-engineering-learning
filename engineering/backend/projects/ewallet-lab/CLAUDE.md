# ewallet-lab (backend) — quy ước cho AI dev

Đọc `DESIGN.md` và `README.md` trước khi đổi bất cứ gì — đó là nguồn spec/ranh giới thật đã xác
minh, không phải tài liệu trang trí. File này chỉ ghi **quy ước vận hành** rút ra từ các lỗi thật
đã gặp, để không lặp lại.

## Services

| Service | Port | DB/queue | Vai trò |
|---|---|---|---|
| user-service | 8090 | Postgres | đăng ký/tra cứu người dùng |
| wallet-service | 8091 | Postgres | số dư, debit/credit |
| topup-service | 8092 | Postgres + Kafka | nạp tiền (MoMo Collection Link đã xác minh) + rút tiền |
| mock-bank-gateway | 8093 | — (Go) | giả lập ngân hàng, cùng công thức chữ ký với topup-service |
| transfer-service | 8094 | Postgres (`ewallet_transfer`) | chuyển tiền P2P (saga có compensation, KHÔNG persist trạng thái saga) + danh bạ người thụ hưởng (#32) + chuyển tiền định kỳ (#31) |
| loyalty-service | 8099 | Postgres | **mô phỏng** Điểm thưởng (issue #19) — claim-trước-move-tiền-sau, xem DESIGN.md |
| bnpl-service | 8098 | Postgres | **mô phỏng** Ví Trả Sau (issue #18) — claim-trước-move-tiền-sau, xem DESIGN.md |
| family-wallet-service | 8100 | Postgres | **mô phỏng** Ví Gia Đình (issue #12) |
| fund-service | 8101 | Postgres | **mô phỏng** Quỹ nhóm (issue #14) — quỹ N người, creator rút |
| investment-fund-service | 8102 | Postgres | **mô phỏng** Sàn Đầu Tư (issue #25) — chứng chỉ quỹ mở, NAV biến động, rủi ro lỗ |
| notification-service | 8103 | — (Go) | ADR-06 — consumer SQS fan-out `payment.completed` (SNS/SQS thật trên AWS, lớp async THỨ HAI, song song Kafka, KHÔNG thay Outbox); `replicas: 0` mặc định trên local |

Spring Boot 3.4.1 / Java 21 / Gradle 8.11.1. Dùng `RestClient` cho gọi service-to-service,
`ResponseStatusException` để map lỗi HTTP, `@DecimalMin` cho validate số tiền.

## Lỗi thật đã gặp — đừng lặp lại

- **Image tag phải là `ewallet-lab/<name>:local`**, không phải `<name>:local`. Helm's
  `_helpers.tpl` build tên image theo `{{ .Values.image.registry }}ewallet-lab/{{ .name }}:...` —
  build sai tag khiến pod chạy image cũ mà không báo lỗi gì (chỉ phát hiện qua so ETag/nội dung
  thật, không phải qua `kubectl` status).
- **`enableServiceLinks: false` bắt buộc trên mọi pod template.** Thiếu field này, Kubernetes tự
  inject biến môi trường kiểu `KAFKA_PORT=tcp://...` vào MỌI pod trong namespace, và Confluent's
  entrypoint đọc nhầm thành cấu hình `port`, crash.
- **Kafka/Zookeeper phải pin `7.5.3`**, không dùng `:latest` — bản mới nhất chuyển sang KRaft-only
  mode mặc định, phá `KAFKA_ZOOKEEPER_CONNECT`.
- **CORS qua `ALLOWED_ORIGIN_PATTERN` env var** (default `http://localhost:*`, Helm override thành
  `http://*.ewallet-lab.local`) — đừng hardcode lại pattern cũ khi thêm service mới.
- **Saga của transfer-service cố tình không persist trạng thái** (gap đã biết, ghi trong DESIGN.md,
  không phải bug). Lưu ý: bản thân service **có** DB `ewallet_transfer` từ #31/#32 (bảng
  `saved_payees`, `recurring_transfers`, `recurring_transfer_logs`), nhưng bảng đó phục vụ danh bạ và
  lịch định kỳ, **không** ghi bước của saga. Đừng "sửa" gap này bằng cách thêm bảng trạng thái saga
  nếu chưa bàn với user (hướng đúng nếu làm: Outbox, xem TD-04 trong DESIGN.md). Cảnh báo triển khai:
  DB và env `DB_*` của service này hiện chỉ có trong cluster, chưa có trong chart/init script (TD-13).
- **Thêm giá trị mới vào một Java enum dùng `@Enumerated(EnumType.STRING)` (vd. `TransactionType`)
  không đủ nếu Postgres đã có sẵn CHECK constraint sinh ra từ Hibernate lúc tạo bảng lần đầu** —
  `ddl-auto: update` KHÔNG tự nới constraint đó. Triệu chứng: JSON hợp lệ, code compile sạch, nhưng
  gọi API trả 500 với lỗi `violates check constraint "..._type_check"` từ Postgres, không phải lỗi
  Java. Fix: `ALTER TABLE ... DROP/ADD CONSTRAINT` thủ công trên DB đang chạy (chỉ cần cho DB đã
  tồn tại — một DB hoàn toàn mới từ `ddl-auto: update` sẽ tự sinh đúng constraint theo enum hiện
  tại, không cần fix gì). Luôn kiểm tra `\d+ <table>` trên Postgres thật khi một field kiểu enum
  mới báo 500 khó hiểu, đừng chỉ đọc log Java.
- **Không tự bịa giá trị enum/string cho field của SERVICE KHÁC** (vd. gọi `wallet-service`'s
  `/debit` với `type` tự nghĩ ra) — luôn đọc entity/enum thật của service đó trước
  (`grep -rn "enum" .../domain/`), dùng lại giá trị đã có hoặc thêm giá trị mới vào đúng enum đó
  (kèm theo bước ALTER constraint ở trên), không đoán tên.

## Deploy & verify (không được bỏ bước nào)

```
eval $(minikube docker-env)

# Java/Gradle services (user/wallet/topup/transfer-service): mỗi service là 1 Gradle project độc
# lập — build context PHẢI là chính thư mục service đó, không phải root ewallet-lab (khác hẳn
# frontend npm workspaces). Context sai → lỗi "not found" khi COPY build.gradle, dễ nhầm là lỗi
# Dockerfile trong khi Dockerfile đúng, chỉ context sai.
docker build -t ewallet-lab/<name>:local <name>

kubectl -n ewallet-lab delete pod -l app=<name>
kubectl -n ewallet-lab rollout status deployment/<name> --timeout=90s
kubectl -n ewallet-lab exec deploy/<name> -- curl -s localhost:<port>/actuator/health/readiness
```

`JAVA_HOME` mặc định của máy có thể trỏ nhầm Java 8 (qua SDKMAN) — nếu `./gradlew build` báo
"requires at least JVM runtime version 17", set `JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-21.jdk/Contents/Home`
riêng cho lệnh đó, đừng đổi global.

**Test luồng thật qua network nội bộ cluster** (không cần đợi `minikube tunnel`):
`kubectl -n ewallet-lab exec deploy/<any-service> -- curl -s http://<other-service>:<port>/...` —
gọi thẳng qua Service DNS trong cluster, dùng để verify logic nghiệp vụ (debit/credit/IPN) trước
khi cần tới Ingress. Rất hữu ích để test các case xác suất thấp (vd. mock-bank-gateway ~7% fail
ngẫu nhiên) bằng cách lặp lại request nhiều lần.

Verify qua **Ingress host thật** (`api.ewallet-lab.local`), không phải `localhost:<port>` trực
tiếp — hit thẳng port sẽ né qua CORS/Ingress config đang test, cho kết quả sai lệch.

`minikube tunnel` cần `sudo` — không tự chạy được, phải nhờ user chạy trong terminal riêng nếu
tunnel chưa sống.

## Nguồn spec — nguyên tắc bất di bất dịch

Field nào lấy từ MoMo/ngân hàng/quy định thật → phải fetch xác minh trực tiếp, ghi nguồn trong
DESIGN.md, đánh dấu rõ ràng phần nào là "đã xác minh" vs "tự thiết kế theo logic phổ quát". Không
suy đoán tên field từ trí nhớ. Không bao giờ dùng tên/logo MoMo thật trong UI hay data — dự án là
bản clone học tập, không phải sản phẩm thương mại đội lốt.

## Kiến trúc doanh nghiệp & Căn chỉnh Kỹ thuật với Nghiệp vụ (Enterprise Architecture Alignment)

Mọi thay đổi kỹ thuật của `agent-dev` phải tuân thủ 5 nguyên lý kiến trúc tài chính doanh nghiệp:

1. **Sổ cái duy nhất (Single Source of Truth / Ledger Sanctity)**:
   - `wallet-service` là nguồn sự thật DUY NHẤT về tiền mặt trong ví (Core General Ledger).
   - Tuyệt đối không service phụ trợ nào (BNPL, Quỹ nhóm, Sàn đầu tư, Loyalty) được tự tạo "số dư tiền mặt ảo" cạnh tranh với `wallet-service`. Mọi tác vụ liên quan đến tiền mặt bắt buộc phải quy về `/debit` hoặc `/credit` tại `wallet-service`.

2. **Căn chỉnh Chế độ Thất bại theo Bản chất Nghiệp vụ (Fail-Open vs Fail-Closed)**:
   - *Tuân thủ pháp luật (Regulatory & Compliance)*: Bắt buộc **FAIL-CLOSED**. Hạn mức tháng TT 40/2024 (#7) và Step-up xác thực QĐ 2345 (#15) KHÔNG ĐƯỢC PHÉP bypass khi gặp lỗi hay gián đoạn.
   - *Tính năng giá trị gia tăng (Auxiliary / Add-on services)*: Ưu tiên **FAIL-OPEN**. Ví dụ: `family-wallet-service` gặp sự cố không được phép làm tê liệt toàn bộ luồng thanh toán cốt lõi của hàng triệu user khác.

3. **Cơ chế Triệt tiêu Tranh chấp Tiền tệ (Zero-Loss / Zero-Creation Concurrency)**:
   - Mọi luồng di chuyển tiền xuyên service (distributed business process) phải tuân theo pattern: **Claim trước (local lock/optimistic lock) -> Di chuyển tiền (remote call) -> Commit/Revert (compensation)**.
   - Tránh tuyệt đối check-then-act không có khoá dẫn đến bug "sinh tiền từ hư không" (như #10) hoặc "mất tiền mid-flight" (như #14).
   - Khuôn "claim trước" đúng cho chiều tiền **ra** khỏi một số dư. Với chiều tiền **vào** một số dư rút được (cộng quỹ, cộng ví...), xem nguyên lý 7: claim "cộng" trước là tạo giá trị chưa có nguồn (bug #60).

4. **Trách nhiệm Giải trình & Kiểm toán (Auditability & Traceability)**:
   - Mọi lần ghi sổ cái bắt buộc kèm `reference` (ID giao dịch nghiệp vụ gốc), `TransactionType` đã được cấp phép, và `note` rõ ràng. Không ghi sổ "nặc danh".

5. **Ngân sách Tài nguyên & Khả năng Phục hồi (Resource Isolation & Resilience)**:
   - Toàn hệ thống dùng chung 1 Postgres server với `max_connections=200`: Mọi service Java bắt buộc giới hạn `hikari.maximum-pool-size: 5` để đảm bảo ngân sách connection khi rolling-restart.

6. **Loại giao dịch theo bản chất kế toán, không theo kênh (Transaction Type ≠ Channel)**:
   - `TransactionType` chỉ mô tả bản chất kế toán của bút toán (tiền vào ví từ ngoài, tiền ra khỏi ví, chuyển nội bộ...). Kênh hay nguồn (ngân hàng, Google Pay, Apple Pay, QR, VNPAY...) là thuộc tính riêng, ví dụ `source`/`providerRef`/`channel`, lưu ở service nghiệp vụ.
   - Không tạo `TransactionType` mới chỉ vì có kênh mới. Mỗi loại mới phải được thêm vào mọi quy tắc tuân thủ (hạn mức tháng #7, step-up #15, eKYC #40); quên một chỗ là bỏ qua kiểm soát pháp lý.
   - Nguồn: ADR-03 trong DESIGN.md (nạp từ thẻ token hoá ghi `TOPUP` + `source`). Operator duyệt nâng thành nguyên lý ngày 2026-10-18, qua AskUserQuestion trong phiên Claude Code.

7. **Thứ tự theo bản chất tài chính (Debit trước khi tạo giá trị tiêu được)**:
   - Bước nào làm xuất hiện số dư hoặc quyền rút được ở nơi khác (cộng quỹ, cộng ví, mở hạn mức) chỉ được thực hiện **sau khi** bước lấy tiền từ nguồn đã được xác nhận, đồng bộ, trong cùng request.
   - Outbox/hàng đợi chỉ dành cho bước mà trì hoãn không tạo ra giá trị tiêu được: credit đến chậm, hoàn tiền, bù trừ, thông báo.
   - Câu hỏi kiểm tra cho mọi luồng mới: (1) bước nào tạo giá trị tiêu được? (2) bước nào lấy tiền từ nguồn? (3) có ai tiêu được (1) trước khi (2) được xác nhận không? Nếu có, (2) phải đồng bộ và xong trước.
   - Nguồn: ADR-05 trong DESIGN.md (bug #60: outbox claim-first cho góp quỹ làm quỹ tăng trước khi ví bị trừ, người tạo quỹ rút được tiền chưa tồn tại). Operator chọn phương án (B) ngày 2026-10-24, qua AskUserQuestion trong phiên Claude Code (do orchestrator hỏi).

## Mọi Deployment mới phải khai báo resources (issue #53)

Thêm entry vào map `resources:` trong `deploy/helm/ewallet-lab/values.yaml` (requests + limits memory, cpu requests)
rồi gọi helper `{{- include "ewallet-lab.resources" (dict "root" $ "name" "<ten>") | nindent 10 }}` trong container;
service Java thêm env `JAVA_TOOL_OPTIONS` từ helper `ewallet-lab.javaToolOptions`. Thiếu entry thì `helm template` lỗi.
Ngân sách RAM tổng: DESIGN.md mục "Ngân sách RAM".

