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
