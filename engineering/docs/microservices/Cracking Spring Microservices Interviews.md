# Cracking Spring Microservices Interviews — Course Summary

Nguồn: [`Cracking Spring Microservices Interviews.pdf`](Cracking%20Spring%20Microservices%20Interviews.pdf) —
Munish Chandel (Shunya Foundation). Sách ôn phỏng vấn Spring Boot + Spring Cloud, không phải tutorial nhập môn.

**Lưu ý về stack đã cũ**: sách viết ~2018, dùng Netflix OSS (Ribbon, Hystrix, Zuul) — các thư viện này đã vào
maintenance mode. Khi trả lời phỏng vấn hiện nay, nên nhắc kèm bản thay thế hiện đại:
- Ribbon → **Spring Cloud LoadBalancer**
- Hystrix → **Resilience4j**
- Zuul → **Spring Cloud Gateway**

Concept (circuit breaker, bulkhead, client-side load balancing...) vẫn đúng, chỉ khác tên thư viện.

**Cách luyện tập**: che phần trả lời, chỉ đọc câu hỏi (in đậm), tự trả lời trước rồi mới xem tóm tắt bên dưới.
Tick `[ ]` → `[x]` khi đã tự trả lời đúng không cần xem đáp án. Có thể nhờ tôi quiz trực tiếp theo từng module.

---

## Module 1 — Core Concepts (Part I)

### 1. Core Concepts in Microservices

- [ ] **1.1 Cohesion là gì?** Mức độ tập trung của 1 component vào 1 việc. Microservice nên có cohesion cao — mỗi service làm tốt 1 việc.
- [ ] **1.2 Coupling là gì?** Mức độ phụ thuộc giữa 2 component. Cohesion cao thường đi kèm coupling thấp.
- [ ] **1.3 Immutability trong microservices?** Service immutable = deploy xong không sửa tay hạ tầng nữa → dễ scale/HA. Docker là enabler điển hình.
- [ ] **1.4 Open/Closed Principle?** Class mở để extend, đóng để sửa đổi — dùng kế thừa/override thay vì sửa code cũ.
- [ ] **1.5 DRY?** Không lặp code, nhưng **không** dùng chung 1 unified model xuyên Bounded Context (vi phạm DDD) — chỉ share code kỹ thuật thuần túy (VD: `ServiceResponse` wrapper).
- [ ] **1.6 SOLID gồm gì?** Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion (Robert C. Martin).
- [ ] **1.7 Single Responsibility Principle?** 1 class chỉ nên có 1 lý do để thay đổi.
- [ ] **1.8 8 Fallacies of Distributed Computing?** Network reliable / Latency = 0 / Bandwidth vô hạn / Network an toàn / Topology không đổi / 1 admin duy nhất / Transport cost = 0 / Network đồng nhất — tất cả đều **sai** trong thực tế, phải thiết kế resilient (circuit breaker, OAuth2/JWT, API Gateway).
- [ ] **1.9 CI là gì?** Merge code thường xuyên vào repo chung, mỗi commit chạy build pipeline (unit test, integration test, code quality, coverage, e2e).
- [ ] **1.10 CAP Theorem?** Distributed store chỉ đạt tối đa 2/3: Consistency, Availability, Partition Tolerance. RDBMS = CA; Cassandra/DynamoDB = AP (eventual consistency); MongoDB/Redis = CP.
- [ ] **1.11 12 Factor App gồm 12 yếu tố nào?** Codebase (1 codebase nhiều deploy) · Dependencies (khai báo tường minh) · Config (lưu ngoài code) · Backing services (treat như attached resource, không hardcode URL) · Build-Release-Run (tách biệt 3 giai đoạn) · Processes (stateless) · Port binding (self-contained, không cần external servlet container) · Concurrency (scale ngang qua nhiều process) · Disposability (start/stop nhanh) · Dev/Prod parity · Logs (treat như event stream, ra stdout) · Admin processes (chạy tách biệt, VD: DB migration).
- [ ] **1.12 Git workflow điển hình?** Feature branch → merge vào `develop` (Jenkins tự build/test/deploy stage) → merge vào `master` (Jenkins tự deploy production).

### 2. Introduction to Microservices

- [ ] **2.1 Đặc điểm của kiến trúc microservices?** High cohesion, loose coupling, bounded context, tổ chức theo business capability, continuous delivery, versioning song song, fault tolerance, decentralized data (mỗi service tự chọn DB), eventual consistency, security tự thân (JWT/OAuth2).
- [ ] **2.2 Lợi ích?** Autonomous deployment, culture shift, technology diversification (mỗi service 1 stack riêng), DevOps culture.
- [ ] **2.3 Thách thức?** Cần DevOps mạnh, độ phức tạp distributed computing, quản lý config trên diện rộng, versioning, cô lập service lỗi, service discovery động, aggregate log/metrics xuyên nhiều service.
- [ ] **2.4 Khác biệt Microservices vs SOA?** SOA dùng ESB (nặng, vendor lock-in); microservices dùng REST/AMQP đơn giản + "smart endpoints, dumb pipes". Microservices tự động hoá deploy hoàn toàn, nhỏ hơn SOA, sở hữu data riêng (SOA hay share DB), độc lập công nghệ hơn. → Microservices là "cách làm SOA tốt" chứ không phải đối thủ của SOA (Martin Fowler).

---

## Module 2 — Microservices Recipes (Part II, Chapter 3)

### 2.1 Nền tảng & Thiết kế boundary

- [ ] **3.1–3.2 Định nghĩa Microservices? DDD là gì?** Microservices = style kiến trúc gồm nhiều service nhỏ tự trị (Sam Newman). DDD (Eric Evans) = kỹ thuật modeling: tập trung vào core domain, hợp tác domain expert + dev để tinh chỉnh model.
- [ ] **3.3 Bounded Context?** Mỗi domain con có model riêng, opaque với domain khác — giải quyết vấn đề "1 model thống nhất cho cả doanh nghiệp" (rất khó, dễ gây hiểu nhầm giữa team).
- [ ] **3.4 Polyglot Persistence?** Dùng nhiều loại DB khác nhau theo nhu cầu: RDBMS (giao dịch), MongoDB (catalog), Cassandra/DynamoDB (key-value/analytics), Redis (cache/session), Neo4j (graph/recommendation). Áp dụng được cả cho monolith.
- [ ] **3.5 Vì sao Microservices tốt hơn Monolith?** Monolith = 1 khối (DB + server + client) → mỗi thay đổi phải deploy lại toàn bộ, scale bằng cách nhân bản cả khối. Microservices tách theo business capability, giao tiếp async, scale từng phần độc lập.
- [ ] **3.6 In-process nhanh hơn network call — vậy sao vẫn chọn microservices?** Overhead latency network không đáng kể so với lợi ích scale; VPC hiện đại tốc độ rất cao. Đánh đổi hợp lý cho hệ thống lớn.
- [ ] **3.7 Microservices khác SOA thế nào (chi tiết)?** = SOA bỏ ESB, dùng REST đơn giản, có hướng dẫn rõ cách chia service theo bounded context — SOA thì không.
- [ ] **3.8 Small-services vs Microservices?** Nhỏ không đồng nghĩa là microservice — phải tuân Bounded Context + Single Responsibility mới tính.
- [ ] **3.9 Lợi ích chi tiết?** Autonomous deployment, culture shift, technology diversification, DevOps culture.
- [ ] **3.10 Cách chia 1 app lớn thành microservices đúng cách?** Theo business capability (VD e-shop: Product Catalogue, Inventory, Orders, Payments, Shipments, Demand Generation, User Accounts, Recommendations, Notifications) — KHÔNG chia theo layer kỹ thuật.
- [ ] **3.11 1 microservice nên to cỡ nào?** "Nhỏ nhất có thể, to nhất cần thiết để đại diện đúng 1 domain concept" (Martin Fowler) — size không phải tiêu chí chính, Bounded Context mới là tiêu chí.

### 2.2 Giao tiếp giữa các service

- [ ] **3.12 Microservices giao tiếp thế nào?** REST/HTTP (sync) hoặc AMQP/JMS/Kafka (async). Sync dùng RestTemplate/WebClient/FeignClient + Ribbon (LB) + Hystrix (circuit breaker).
- [ ] **3.13 Nên chọn sync hay async?** Ưu tiên **async cho mọi thao tác ghi (POST/PUT)** qua queue tin cậy; sync chỉ chấp nhận được ở tầng Aggregation của API Gateway (không chứa business logic). Nếu service-to-service vẫn cần sync cho GET → dấu hiệu chia bounded context sai, cần backlog để sửa.
- [ ] **3.14 Orchestration vs Choreography?** Orchestration = có "nhạc trưởng" trung tâm điều khiển từng bước (tightly coupled, coi là anti-pattern). Choreography = mỗi service như 1 state machine, tự phản ứng theo event (loosely coupled) — nên ưu tiên.
- [ ] **3.15 Giữ ACID trong kiến trúc microservices?** 2 lựa chọn: 2-Phase Commit (nên tránh, fragile) hoặc **eventual consistency** qua async messaging (khuyến nghị).

### 2.3 Triển khai & Vận hành

- [ ] **3.16 Tần suất release hợp lý?** Không có con số cố định — phụ thuộc mức độ tự động hoá (Amazon: ~mỗi 11.6s, Etsy: 50+ lần/ngày). Điều kiện: service tự trị, automation tốt, mỗi thay đổi nhỏ/low-risk.
- [ ] **3.17 Zero-downtime deployment?** Blue/Green: chạy song song 2 phiên bản, chỉ 1 bản nhận traffic thật; dùng Spring Retry + Ribbon để tránh gọi nhầm instance vừa tắt trong lúc chờ Eureka cập nhật registry (~30s).
- [ ] **3.18 Zero-downtime khi có thay đổi DB?** Backward-compatible (thêm cột mới, cho null) → dễ, dùng Flyway. Non-compatible (đổi tên cột) → tạo cột mới song song, copy dữ liệu, xử lý migrate thủ công sau khi chọn phiên bản thắng.
- [ ] **3.19 Di chuyển user dần sang bản mới?** Canary Releasing — dùng API Gateway route dần từng phần traffic, giữ 2 bản chạy song song lâu hơn blue/green.
- [ ] **3.20 Monitor fleet microservices?** Graphite + Grafana (metrics theo thời gian), Spring Boot Admin (health/hystrix/JVM), hoặc công cụ trả phí (AppDynamics, DynaTrace).
- [ ] **3.21 Troubleshoot request lỗi xuyên nhiều service?** Dùng **Correlation ID** (GUID) gắn ở API Gateway, truyền xuyên suốt để aggregate log tìm điểm lỗi đầu tiên.
- [ ] **3.22 Các layer trong 1 microservice?** Resource Layer (REST) → Service Layer (business logic) → Domain/Repository (Spring Data) → ORM/Data Mapper (Hibernate/JPA).

### 2.4 Phát triển với Java/Spring

- [ ] **3.23–3.24 Phát triển bằng Java thế nào? Deploy nhiều service chung 1 Tomcat có ổn không?** Spring Boot + Spring Cloud, embed servlet container (uber jar) — **không nên** chạy nhiều service chung 1 container (vi phạm 12 Factor: mỗi service = 1 process riêng).
- [ ] **3.25 Cloud Native App là gì?** App thiết kế cho cloud, dựa trên DevOps + Continuous Delivery + Microservices + Container.
- [ ] **3.26 Spring Boot là gì?** Tạo app Spring standalone, production-ready, tự động config, embed Tomcat/Jetty/Undertow, không cần XML.
- [ ] **3.27 Spring Cloud là gì?** Bộ thư viện tích hợp pattern phân tán: Config Server (config), Eureka (discovery), Ribbon (LB), Hystrix (circuit breaker), Zuul (gateway), Sleuth (tracing), Security OAuth2/JWT.
- [ ] **3.28 application.yml vs bootstrap.yml?** `application.yml` = config thông thường của Spring Boot. `bootstrap.yml` = load **trước**, chỉ cần khi dùng Spring Cloud Config (chứa URL config-server, tên app) — override bởi remote config khi bootstrap xong.

### 2.5 Service Discovery & Load Balancing

- [ ] **3.29–3.30 Service discovery hoạt động thế nào? Eureka Server?** Eureka Server = registry trung tâm; mỗi service (Eureka Client) đăng ký + gửi heartbeat mỗi 30s, bị loại sau ~90s không renew. Client cache registry cục bộ nên vẫn hoạt động khi Eureka Server down tạm thời.
- [ ] **3.31–3.35 Externalize config?** Spring Cloud Config Server (backing bằng git) cấp config tập trung theo môi trường (`config-dev`/`config-qa`/`config-prod`). Config-first bootstrap (mặc định, config-server phải khởi động trước tiên) vs Discovery-first (lấy config-server qua Eureka, linh hoạt hơn nhưng thêm round-trip). `fail-fast: true` để service dừng nếu không kết nối được config-server. `@RefreshScope` để refresh config động không cần restart.
- [ ] **3.36–3.44 Ribbon (client-side load balancing)?** Ribbon tự động load balance (round-robin mặc định), retry sang instance khác khi fail, tích hợp Hystrix. Nếu cả Eureka lẫn Ribbon đều có trên classpath → Ribbon tự lấy server list từ Eureka (có thể tắt bằng `ribbon.eureka.enabled: false`). `@EnableDiscoveryClient` (generic, chọn Eureka/Consul theo classpath) vs `@EnableEurekaClient` (chỉ Eureka). Zone-aware routing dùng `eureka.instance.metadataMap.zone` + `preferSameZoneEureka: true`. `DiscoveryClient` API để liệt kê tất cả instance của 1 service.

### 2.6 API Gateway

- [ ] **3.45 API Gateway là gì?** Single entry point cho client, xử lý cross-cutting concern (security, monitoring, resiliency), có thể aggregate response từ nhiều service, dịch protocol.
- [ ] **3.46–3.47 Bảo vệ internal endpoint & token nhạy cảm?** `zuul.ignored-patterns` để ẩn endpoint nội bộ; `zuul.sensitiveHeaders` để kiểm soát header nào không relay xuống downstream.
- [ ] **3.48 Retry request thất bại sang instance khác?** Thêm `spring-retry` vào classpath → RestTemplate/Feign/Zuul tự động retry (cấu hình qua `ribbon.MaxAutoRetries`).

### 2.7 Resilience — Circuit Breaker, Hystrix, Bulkhead

- [ ] **3.49–3.50 Circuit Breaker Pattern & 3 trạng thái?** Bọc remote call, đếm lỗi — vượt ngưỡng thì **Open** (fail ngay, không gọi thật) → sau timeout chuyển **Half-Open** (thử lại) → thành công thì **Closed** lại, thất bại thì quay lại Open.
- [ ] **3.51–3.53 Use-case, lợi ích, dùng được cho async không?** Dùng ở mọi call sync dễ fail; ngăn cascading failure, cho service lỗi thời gian hồi phục, hỗ trợ fallback (trả cached data). Có thể dùng cho async khi queue đầy.
- [ ] **3.54–3.55 Hystrix là gì? Tính năng chính?** Implementation circuit breaker của Netflix, chạy mỗi circuit trong thread pool riêng (bulkhead), thu thập metrics (traffic, latency, error %) → Turbine + Hystrix Dashboard.
- [ ] **3.56–3.58 Dùng Hystrix fallback thế nào?** `@EnableCircuitBreaker` + `@HystrixCommand(fallbackMethod=...)`. Không cần wrap hystrix cho API không bao giờ được gọi liên service, hoặc batch job nội bộ. Dùng `ignoreExceptions` để loại trừ exception không nên trigger fallback.
- [ ] **3.59 Strangulation Pattern?** Dùng Zuul route dần từng endpoint từ hệ thống cũ sang service mới, không strangle toàn bộ 1 lần.
- [ ] **3.60–3.64 Circuit Breaker vs try/catch thường? Circuit Breaker vs Hystrix? Dùng ở đâu?** Circuit breaker tốt hơn try/catch vì: ngừng gọi khi vượt ngưỡng (tiết kiệm thread/network), có fallback method, tích hợp bulkhead. Circuit Breaker = pattern; Hystrix = 1 implementation. Dùng ở API Gateway, Aggregator, Web Front gọi nhiều service — **không cần** ở mobile client gọi thẳng REST (trừ tại gateway).
- [ ] **3.65–3.67, 3.69 Bulkhead Pattern & cách Hystrix triển khai?** Ý tưởng như khoang tàu — cô lập lỗi vào 1 khu vực, không cho sập cả hệ thống. Hystrix giới hạn số concurrent call tới 1 component bằng **Thread Isolation** (pool thread riêng, hỗ trợ timeout) hoặc **Semaphore Isolation** (permit, không timeout được, phù hợp khi cần propagate security context).
- [ ] **3.62–3.63, 3.68 Request Collapsing? Smart endpoints & dumb pipes?** Request Collapsing (Hystrix) gộp nhiều request thành 1 call backend, giảm thread/connection. "Smart endpoints, dumb pipes" (Martin Fowler): kênh giao tiếp (pipe) không chứa business logic, mọi xử lý nằm ở endpoint (ngược với ESB "smart pipe").

### 2.8 Pattern nâng cao

- [ ] **3.70 Versioning API?** Ưu tiên version trong URL (`/api/v1/...`), đảm bảo mỗi version chỉ chứa thay đổi backward-compatible; dùng Consumer-Driven Tests để phát hiện breaking change sớm.
- [ ] **3.71 Chia service theo technical capability hay business capability?** Luôn ưu tiên **business capability**; technical capability chỉ chấp nhận cho infrastructure service (email, sms, storage, queue).
- [ ] **3.72–3.73 Random port khi start? Chạy business logic lúc startup?** Dùng `SocketUtils.findAvailableTcpPort` để tránh xung đột port khi chạy nhiều instance cùng host — luôn định vị service khác qua Eureka, không hardcode host/port. `CommandLineRunner`/`ApplicationRunner` (+ `@Order`) để chạy logic sau khi context đã load xong (khác `@PostConstruct` chạy sớm hơn, trước khi context hoàn tất).
- [ ] **3.74 Reporting service trong hệ phân tán?** Sai: HTTP pull (chậm, tải DB vận hành) hoặc DB pull trực tiếp (tightly coupled). Đúng: **Asynchronous event-driven push model** — mỗi service tự emit event, reporting service lắng nghe và build báo cáo riêng (Sam Newman gọi là "data pump").
- [ ] **3.75 Event Sourcing/CQRS dùng khi nào?** Chỉ cho use-case phù hợp (VD: Shipping Tracker), **không** áp dụng toàn hệ thống vì tăng độ phức tạp.
- [ ] **3.76 Gửi business error từ REST service?** Không chỉ dựa vào HTTP status — wrap response trong object custom (`ServiceResponse` có `errorCode`, `userMessage`, `developerMessage`).
- [ ] **3.77 Share chung database giữa các service có nên không?** Không — vi phạm Bounded Context. 3 cách đúng: DB server riêng (tốn kém), **schema riêng/service** (phổ biến nhất với RDBMS), hoặc table riêng/service (phù hợp DB-as-a-service như DynamoDB).
- [ ] **3.78–3.79 Đảm bảo email chỉ gửi khi transaction DB thành công? Atomic update DB + publish event?** Dùng `@TransactionalEventListener` hoặc `TransactionSynchronizationManager.registerSynchronization` (afterCommit) — nhưng không đảm bảo atomicity tuyệt đối giữa 2 thao tác. Đây chính là vấn đề cần **Outbox Pattern / Local Transaction multi-step** thay vì 2-phase commit qua DB + Message Broker (vi phạm CAP).

### 2.9 Security-adjacent Recipes, Best Practices, Performance

- [ ] **3.80–3.82 Propagate security context giữa service? Token Relay?** Nếu dùng OAuth2 → Token Relay (forward access token downstream, tự refresh khi hết hạn) qua `OAuth2RestTemplate`; nếu Basic Auth → forward Authorization header. Zuul hỗ trợ config `proxy.auth.routes` (oauth2/passthru/none) theo từng route.
- [ ] **3.83 Revoke Access/Refresh Token khi bị lộ?** JWT không revoke được trực tiếp (stateless). Damage toàn hệ thống → đổi private key ký JWT (mọi user logout). Damage 1 client → đổi client credentials (chỉ ảnh hưởng refresh token, access token cũ vẫn sống tới khi hết hạn). Damage 1 user → chặn theo device ID thay vì chặn cả JWT.
- [ ] **3.84 Authentication và Authorization nên là 1 service không?** Không nhất thiết — có thể tách 2 service (Authentication xác minh danh tính, Authorization phát token), giao tiếp REST với nhau.
- [ ] **3.85 API Key security?** Đơn giản nhưng hạn chế: full access, không phân biệt client/end-user, không thêm custom claim được, không có expiry (phải revoke thủ công).
- [ ] **3.86 Best practices tổng quát?** Partition đúng theo domain, DevOps culture, thiết kế stateless, thiết kế chịu lỗi (retry/circuit breaker/bulkhead theo đúng loại lỗi), versioning rõ ràng, ưu tiên async, thiết kế eventual consistency, thiết kế idempotent, **share càng ít càng tốt** (kể cả vi phạm DRY một phần để giữ Bounded Context).
- [ ] **3.87–3.88 Có nên share domain model/DTO chung? Share code chung thế nào?** Không share unified model (mỗi service tự định nghĩa `Customer` với field riêng theo nhu cầu). Code dùng chung thuần kỹ thuật (không phải domain model) thì đóng gói thành **versioned jar** qua private Maven repo (Artifactory/Nexus) — không bao giờ share qua source code copy-paste.
- [ ] **3.89 Continuous Delivery là gì?** Release liên tục các thay đổi nhỏ, low-risk, sẵn sàng deploy production bất kỳ lúc nào; Dev + Test + Ops làm việc như 1 team.
- [ ] **3.90–3.91 Cải thiện performance? Caching ở đâu?** Cache nhiều tầng: Server-side (Redis/Memcache), Gateway cache, Client-side (cache-header/E-Tag). Tối ưu thread pool servlet container (Tomcat/Jetty/Undertow), cân nhắc HTTP/2.
- [ ] **3.92–3.93 Protocol nào cho giao tiếp?** Client→service: REST/HTTPS. Inter-service: ưu tiên **AMQP (RabbitMQ)** hoặc Kafka cho async — lợi ích: performance (fire-and-forget), reliability (guaranteed delivery), hỗ trợ **publish/subscribe** (1 producer, nhiều consumer không cần biết nhau).
- [ ] **3.94–3.96 Document API bằng gì?** Swagger/OpenAPI (`springfox-swagger2` + `springfox-swagger-ui`) — UI tương tác, có thể gọi thử endpoint trực tiếp.

---

## Module 3 — Security in Microservices (Chapter 4)

- [ ] **4.1 Vì sao Basic Auth không phù hợp microservices?** Phải gửi lại credentials mỗi request, không phân biệt User vs Client App, không hỗ trợ scope/token, tốn CPU khi so khớp BCrypt liên tục, rủi ro khi lưu credentials trên mobile.
- [ ] **4.2–4.4 Vì sao chọn OAuth2? Cách hoạt động? 4 role?** OAuth2 đơn giản cho client, token mang nhiều thông tin (clientId/role/scope/expiry), stateless, hỗ trợ refresh token, phân biệt rõ user/machine. 4 role: **Resource Owner** (user), **Resource Server** (microservice), **Authorization Server** (cấp token), **Client** (app gọi thay resource owner).
- [ ] **4.5–4.8 Các grant type & khi nào dùng?** Authorization Code (web app, client secret giữ được an toàn) · Resource Owner Password Credentials (mobile app tin cậy, app tự nhà) · Implicit (SPA/mobile không giữ được secret) · Client Credentials (giao tiếp máy-máy, batch job, không có user) · Refresh Token (lấy access token mới).
- [ ] **4.9 OAuth2 áp dụng vào microservices ra sao?** Resource Server = microservice; Web app dùng Authorization Code; SPA dùng Authorization Code/Implicit; Mobile dùng Password grant; Service-to-service dùng Client Credentials hoặc Token Relay.
- [ ] **4.10–4.12 JWT là gì? Cấu trúc?** JSON Web Token (RFC 7519) — gọn, tự chứa thông tin (không cần query DB lại), ký số để verify nguồn gốc. Cấu trúc: `header.payload.signature` (Base64), payload chứa claim (uid, scope, exp, roles...), signature = HMAC/RSA của header+payload.
- [ ] **4.13–4.15 AccessToken vs RefreshToken? Gọi resource được bảo vệ?** AccessToken (bắt buộc) dùng xác thực API; RefreshToken (tùy chọn) dùng lấy AccessToken mới khi hết hạn — cần client credentials khi gọi refresh. Gọi API: header `Authorization: Bearer <token>`.
- [ ] **4.16–4.18 RefreshToken vĩnh viễn được không? Vì sao Client Credentials không có RefreshToken?** Có thể set `Integer.MAX_VALUE` nhưng **không nên** vì rủi ro bảo mật — nên set `reuseRefreshTokens(false)` để cấp refresh token mới mỗi lần. Client Credentials không cần refresh token vì client luôn tự giữ credentials, có thể xin access token mới trực tiếp bất kỳ lúc nào.
- [ ] **4.19 Logout với JWT?** Không thể invalidate JWT trước hạn (stateless) — cách thực tế: xoá token khỏi client storage + dùng access token sống ngắn kèm refresh token, hoặc xây stateful logout service (blacklist).
- [ ] **4.20–4.22 Security inter-service? @EnableResourceServer?** 2 case: gọi thay user → Token Relay; gọi nội bộ không thay user → Client Credentials (không dùng Resource Owner Password cho case này — anti-pattern). `@EnableResourceServer` đánh dấu service là nơi cần access token để xử lý request.
- [ ] **4.23–4.24 @EnableOAuth2Sso vs @EnableOAuth2Client?** Sso = app đóng vai OAuth2 client, tự redirect user đi login rồi đổi Authorization Code lấy Access Token. Client = cho phép forward access token đã có xuống service khác qua `OAuth2RestTemplate`.
- [ ] **4.25 Thêm custom claim vào JWT?** Implement `TokenEnhancer`, gắn vào `DefaultTokenServices.setTokenEnhancer()`.
- [ ] **4.26–4.27 Security best practices? Enable ở service layer thế nào?** Luôn đặt security ở **service layer** (không chỉ chặn URL — URL dễ đổi/bị bypass), mặc định deny-by-default, luôn dùng HTTPS. Bật bằng `@EnableGlobalMethodSecurity(prePostEnabled=true)` + `@PreAuthorize("hasRole('ADMIN')")`.

---

## Module 4 — Testing Aspects (Chapter 5)

- [ ] **5.1 Tools/thư viện testing chính?** JUnit/TestNG (test runner), Mockito (mock), Wiremock/Hoverfly (stub third-party), Spring Test/Spring Boot Test (MockMvc, TestRestTemplate), Pact (Contract testing), Selenium (E2E UI), Rest-Assured.
- [ ] **5.2 Test Pyramid (Mike Cohn)?** 3 tầng: **Unit** (nhiều nhất, nền tảng) → **Service/Integration** (test interface theo kỳ vọng client) → **End-to-End** (ít nhất, test cả hệ thống UI/API thật). Càng lên cao càng ít test.
- [ ] **5.3–5.4 4 chiến lược test? Mock vs Stub?** Unit, Integration, Contract-Driven, End-to-end. **Mock** = verify hành vi (có gọi đúng method không), setup động lúc chạy test (Mockito). **Stub** = giả lập response cố định, viết sẵn tĩnh, không cần framework.
- [ ] **5.5–5.6 Unit test & Integration test khác nhau ra sao?** Unit: không load Spring Context, mock hết dependency, chỉ test 1 component (Service/Utility layer phù hợp nhất). Integration: bootstrap thật (DB/network/filesystem), có thể dùng H2 in-memory thay RDBMS thật để test nhanh — chia 4 loại: HTTP / Database / FileSystem / External Service integration.
- [ ] **5.7 Contract-Driven (Consumer-Driven Contract) Test?** Cả consumer và provider cùng viết test theo 1 "hợp đồng" chung (dùng **Pact**) — phát hiện breaking change sớm mà không cần deploy cả hệ thống để test E2E.
- [ ] **5.8 End-to-End test?** Test qua public endpoint (REST/GUI) như hộp đen, môi trường gần giống production; dùng Selenium cho UI.
- [ ] **5.9 Best practices trong testing?** Test quan trọng như code sản phẩm, tránh trùng lặp test giữa các tầng (đã test ở unit thì không lặp lại ở integration trừ khi thêm giá trị mới), vẫn giữ tối thiểu E2E test dù deadline gấp, tách TestSuite theo mục đích (regression/smoke/build-verification).
- [ ] **5.10 Câu hỏi phỏng vấn hay gặp về testing:**
  - *Non-determinism trong test đến từ đâu, xử lý sao?* Phụ thuộc remote service không ổn định (dùng Test Double/Contract test), code async test bằng `sleep()` cố định (nên poll theo interval hoặc dùng callback), thiếu isolation giữa các test (dọn dữ liệu sau mỗi test, chạy trong transaction rollback, port ngẫu nhiên).
  - *MockMvc vs TestRestTemplate?* Cả hai đều load Spring Context; MockMvc không start container thật, TestRestTemplate start container thật trên port random/định trước.
  - *Test DAO layer thế nào?* `@DataJpaTest` (tự động cấu hình H2 in-memory, chỉ load JPA component).
  - *Test 100+ microservices E2E có cần deploy hết không?* Không — dùng Test Doubles hoặc Contract-Driven Test để né việc phải dựng cả staging environment.
  - *Test bảo mật thế nào?* Integration/E2E test kiểm tra endpoint trả `401 Unauthorized` khi thiếu token hợp lệ.

---

## Ghi chú luyện tập

- Có thể yêu cầu tôi quiz theo từng module (giống cách đã làm với Corporate Finance) — tôi sẽ hỏi ngẫu nhiên trong module, chấm câu trả lời dựa trên bản tóm tắt + nội dung gốc trong PDF.
- Khi phỏng vấn thật, luôn sẵn sàng nói thêm phần "công nghệ đã lỗi thời" (Ribbon/Hystrix/Zuul) → bản thay thế hiện đại, thể hiện hiểu biết cập nhật hơn sách.
