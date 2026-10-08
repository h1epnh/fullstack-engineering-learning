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
| transfer-service | 8094 | — (stateless) | chuyển tiền P2P, saga có compensation, KHÔNG persist state |
| loyalty-service | 8099 | Postgres | **mô phỏng** Điểm thưởng (issue #19) — claim-trước-move-tiền-sau, xem DESIGN.md |
| bnpl-service | 8098 | Postgres | **mô phỏng** Ví Trả Sau (issue #18) — claim-trước-move-tiền-sau, xem DESIGN.md |
| family-wallet-service | 8100 | Postgres | **mô phỏng** Ví Gia Đình (issue #12) |
| fund-service | 8101 | Postgres | **mô phỏng** Quỹ nhóm (issue #14) — quỹ N người, creator rút |
| investment-fund-service | 8102 | Postgres | **mô phỏng** Sàn Đầu Tư (issue #25) — chứng chỉ quỹ mở, NAV biến động, rủi ro lỗ |

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
- **transfer-service cố tình không có DB** (saga không persist) — đây là gap đã biết, ghi trong
  DESIGN.md, không phải bug. Đừng "sửa" bằng cách thêm DB nếu chưa bàn với user.
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

4. **Trách nhiệm Giải trình & Kiểm toán (Auditability & Traceability)**:
   - Mọi lần ghi sổ cái bắt buộc kèm `reference` (ID giao dịch nghiệp vụ gốc), `TransactionType` đã được cấp phép, và `note` rõ ràng. Không ghi sổ "nặc danh".

5. **Ngân sách Tài nguyên & Khả năng Phục hồi (Resource Isolation & Resilience)**:
   - Toàn hệ thống dùng chung 1 Postgres server với `max_connections=200`: Mọi service Java bắt buộc giới hạn `hikari.maximum-pool-size: 5` để đảm bảo ngân sách connection khi rolling-restart.

