# tencentdb-agent-memory — self-hosted deploy log

Repo: https://github.com/TencentCloud/tencentdb-agent-memory
Clone: `/Users/mac/Engineering/GitHub/tencentdb-agent-memory`
(bản sao khác tại `fullstack-engineering-learning/engineering/ai/TencentDB-Agent-Memory`
dùng để đọc source khi trace bug — cùng nội dung, không phải bản chạy)
Scope: hạ tầng cá nhân, không gắn project cụ thể (quyết định của user khi bắt đầu).

## Trạng thái: HOẠT ĐỘNG END-TO-END (2026-11-03) — Claude Code → proxy → DeepSeek → memory-core,
verify bằng session thật: 1 turn 29974 input / 1165 output tokens, stream sạch, không lỗi
parse. Team `personal-lab` + Agent `Agent Engineer` nhận inject memory/skill đúng.

## 3 service healthy

```
docker ps --filter "name=tdai"
tdai-proxy         healthy   0.0.0.0:8096
tdai-memory-hub    healthy   0.0.0.0:8125 (panel), 0.0.0.0:8424 (knowledge)
tdai-memory-core   healthy   0.0.0.0:8420
```

## Endpoint

| Service        | URL                           |
| -------------- | ----------------------------- |
| Panel UI       | http://localhost:8125/        |
| Panel API      | http://localhost:8125/api/v1/ |
| Knowledge API  | http://localhost:8424/v3/     |
| Knowledge Docs | http://localhost:8424/docs    |
| Memory Core    | http://localhost:8420/        |
| Proxy          | http://localhost:8096/        |

## LLM config (`.env` tại `deploy/global-images/.env`, KHÔNG commit — chứa API key)

- Provider: DeepSeek, cả 2 nhóm (memory + proxy) dùng chung 1 key.
- **Lưu ý quan trọng:** model thật của tài khoản DeepSeek này là `deepseek-flash` và
  `deepseek-v4-pro` — KHÔNG phải `deepseek-chat`/`deepseek-reasoner` như tên mặc định
  trong `.env.example`. Luôn verify bằng `GET /v1/models` trước khi set, đừng tin tên
  mẫu trong template.
  - `MEMORY_LLM_MODEL=deepseek-flash` (rẻ, dùng cho summarize/embed nội bộ)
  - `PROXY_UPSTREAM_MODEL=deepseek-v4-pro` (dùng khi coding agent gọi qua proxy)

## Dùng qua Claude Code (proxy chèn thêm memory vào context)

```bash
export ANTHROPIC_BASE_URL=http://127.0.0.1:8096/claude-code/default
export ANTHROPIC_AUTH_TOKEN="$(cat /Users/mac/Engineering/GitHub/tencentdb-agent-memory/deploy/global-images/.admin-key)"
export ANTHROPIC_CUSTOM_MODEL_OPTION="deepseek-v4-pro"   # bắt buộc, xem mục 5 dưới
claude --model deepseek-v4-pro
```

Admin user_key **không ghi secret vào note này** — đọc trực tiếp từ file do script tự
sinh: `deploy/global-images/.admin-key` (file này nằm trong `.gitignore` của repo đó,
không commit).

**Lượt chat đầu của mỗi session mới:**
1. Proxy hỏi (bằng `AskUserQuestion`) có muốn gắn team asset không — chọn "是，关联团队资产"
   (có, gắn team asset) để inject memory/skill/knowledge.
2. Rồi chọn Team → Agent → Task (Task optional, có thể skip).
3. Team đã tạo: `personal-lab` (`team-6zfb4nyjbk`). Agent đã tạo: `Agent Engineer`
   (`agt-6zj268h0ua`), system prompt lưu trong Panel.

## Vận hành

```bash
cd /Users/mac/Engineering/GitHub/tencentdb-agent-memory/deploy/global-images
docker logs -f tdai-memory-core | tdai-memory-hub | tdai-proxy   # xem log
./stop-all.sh                                                     # dừng
./start-all.sh                                                    # chạy lại (interactive — xem dưới)
```

## Vấn đề gặp phải khi setup (để lần sau khỏi lặp lại)

1. **`start-all.sh` là script tương tác** (`interactive_llm_setup`) — luôn hỏi lại cả
   2 nhóm LLM mỗi lần chạy, dù `.env` đã có giá trị (Enter = giữ nguyên). Chạy
   non-interactive bằng cách feed sẵn các dòng Enter qua stdin:

   ```bash
   printf '\n%.0s' {1..20} | ./start-all.sh
   ```

   Số dòng cần: 4 (memory: base/key/model/protocol) + 1 (confirm reuse cho proxy,
   default Yes nếu 2 nhóm giống nhau) — feed dư (20) để có chỗ cho retry nếu key sai,
   script tự dừng và báo lỗi khi hết input thay vì treo.
2. **DeepSeek API key đầu tiên user cung cấp bị HTTP 401** (key không hợp lệ/đã revoke)
   — phải xin key mới. Luôn verify key bằng một curl nhẹ trước khi chạy full script,
   tiết kiệm thời gian:

   ```bash
   curl -sS -m 15 -H "Authorization: Bearer $KEY" https://api.deepseek.com/v1/models
   ```
3. **Docker Desktop daemon không tự chạy** — cần `open -a Docker` rồi đợi
   `docker info` thành công trước khi chạy script (script không tự start Docker).
4. Lần đầu pull cả 3 image (`agentmemory/memory-core`, `memory-hub`, `memory-proxy`)
   từ Docker Hub — mất vài phút, cần mạng ổn định. Không có fallback mirror ngoài
   Tencent nội bộ (`mirrors.tencent.com`, không dùng được từ ngoài Tencent).
5. **Claude Code từ chối `--model deepseek-v4-pro`** ("may not exist or you may not
   have access") — đây là client-side validation của Claude Code, xảy ra TRƯỚC khi
   gửi request, không liên quan proxy/DeepSeek. Fix: set thêm
   `ANTHROPIC_CUSTOM_MODEL_OPTION="deepseek-v4-pro"` (cơ chế chính thức, xem
   https://code.claude.com/docs/en/model-config.md "Add a custom model option") để
   Claude Code bỏ qua validate cho tên model tùy ý.
6. **Sau khi fix (5), vẫn lỗi "model không tồn tại" ở lượt chat đầu** — nguyên nhân
   THỨ HAI, khác hẳn (5): proxy forward đúng request Anthropic-format đến
   `https://api.deepseek.com/v1/messages`, nhưng DeepSeek trả **404** ở path đó.
   `/v1` là path OpenAI-format của DeepSeek (`chat/completions`); endpoint
   Anthropic-Messages-compatible của DeepSeek nằm ở path khác:
   `https://api.deepseek.com/anthropic` (test trực tiếp bằng curl xác nhận
   `POST .../anthropic/v1/messages` và `.../anthropic/messages` đều trả 200, còn
   `.../v1/messages` trả 404). Fix: set
   `PROXY_UPSTREAM_URL=https://api.deepseek.com/anthropic` trong `.env`, rồi chỉ cần
   restart riêng container proxy (không cần restart cả stack):
   ```bash
   cd deploy/global-images
   docker rm -f tdai-proxy
   PROXY_FULL_STACK=1 ./start-proxy.sh
   ```
   Verify end-to-end bằng curl thật qua proxy (dùng đúng path `/v1/messages` mà
   Anthropic SDK/Claude Code tự gắn vào `ANTHROPIC_BASE_URL`, auth header
   `Authorization: Bearer <user_key>`, KHÔNG phải `x-api-key`):
   ```bash
   curl -X POST http://localhost:8096/claude-code/default/v1/messages \
     -H "Authorization: Bearer $(cat .admin-key)" \
     -H "anthropic-version: 2023-06-01" -H "Content-Type: application/json" \
     -d '{"model":"deepseek-v4-pro","max_tokens":20,"messages":[{"role":"user","content":"say OK"}]}'
   ```
   → HTTP 200 xác nhận pipeline hoạt động đúng.
7. **ROOT CAUSE THẬT của "API Error: JSON Parse error: Unexpected token '('"** (lỗi 6
   chỉ fix được network path, KHÔNG fix được lỗi này — đây là bug thứ 3, nặng nhất):
   - Claude Code (Bun/Stainless SDK) gửi header `Accept-Encoding: gzip, deflate, br, zstd`.
   - `MemoryProxy/src/common/constants.ts`: `SKIP_REQUEST_HEADERS_WITH_INTERNAL` (header
     bị chặn khi forward lên upstream) **không có `accept-encoding`** → proxy chuyển
     thẳng header này lên DeepSeek → DeepSeek/CloudFront trả về **response đã nén**
     (brotli/gzip).
   - Node's `undici` (HTTP client proxy dùng để gọi upstream DeepSeek) **tự động
     decompress response ở tầng dưới, độc lập với Accept-Encoding header của client** —
     đây là hành vi mặc định của `fetch()` trong Node. Nên dù `SKIP_RESPONSE_HEADERS`
     có `content-encoding` hay không, byte mà proxy nhận từ `undici` luôn đã được
     decompress sẵn; header gốc `content-encoding: br` trên Response object chỉ phản
     ánh encoding TRÊN DÂY, không phản ánh encoding của bytes proxy thực sự cầm trong tay.
   - **Lần sửa đầu (sai hướng):** tôi tưởng proxy làm passthrough byte-for-byte nên đã
     bỏ `content-encoding` ra khỏi `SKIP_RESPONSE_HEADERS` để header "đi theo" body —
     kết quả: client nhận plain-text bytes (đã decompress bởi undici) nhưng header vẫn
     nói "br" → Claude Code cố brotli-decode plain text → `BrotliDecompressionError`.
   - **Fix đúng (đã áp dụng cuối cùng):** giữ `content-encoding` trong
     `SKIP_RESPONSE_HEADERS` như code gốc (chỉ thêm `accept-encoding` vào
     `SKIP_REQUEST_HEADERS_WITH_INTERNAL` là đủ — không phải vì nó chặn được DeepSeek
     nén, mà để tránh client's exotic `zstd` gây nhiễu, phần decompress thật do undici
     tự xử lý). Verify bằng curl: response từ proxy không còn `content-encoding` header,
     body là SSE plain text sạch.
   - Dùng curl thường (không gửi `Accept-Encoding`) sẽ KHÔNG bao giờ reproduce được bug
     gốc — đây là lý do mọi test tay ban đầu "qua" mà Claude Code thật luôn fail. Chẩn
     đoán được bằng cách chèn 1 raw TCP tap (`scratchpad/raw_tap.py`, forward byte thô
     2 chiều, không đụng tdai-proxy) giữa Claude Code và proxy để bắt bytes thật — thấy
     body chứa `\xef\xbf\xbd` (U+FFFD) lặp lại, dấu hiệu kinh điển của việc decode binary
     nén như UTF-8 text ở đâu đó trong pipeline.
   - **Fix cuối cùng** (patch trực tiếp source trong container đang chạy — container
     này chạy TypeScript thẳng qua `tsx`, không build sẵn, nên sửa `.ts` có hiệu lực
     ngay sau restart, không cần rebuild image):
     ```bash
     docker exec tdai-proxy node -e '
       const fs = require("fs");
       const p = "/app/src/common/constants.ts";
       let c = fs.readFileSync(p, "utf8");
       c = c.replace(
         "\"x-tdai-user-key\",\n]);",
         "\"x-tdai-user-key\",\n  \"accept-encoding\",\n]);"
       );
       fs.writeFileSync(p, c);
     '
     docker restart tdai-proxy
     ```
     (chỉ patch request-header skip-list; response-header skip-list giữ nguyên bản gốc,
     KHÔNG đổi.)
   - ⚠️ **Patch này KHÔNG bền** — nó sửa trên writable layer của container đang chạy.
     Nếu sau này chạy `docker rm tdai-proxy && ./start-proxy.sh` (recreate container từ
     image gốc trên Docker Hub), patch sẽ MẤT và bug quay lại — phải chạy lại đoạn lệnh
     patch trên sau mỗi lần recreate. Về lâu dài nên báo upstream (GitHub issue cho
     TencentCloud/tencentdb-agent-memory) hoặc tự build image riêng có patch này.

## Bug #4: Chat Memory không update — mọi turn thật từ turn 2 bị skip ghi nhớ

Phát hiện sau khi hỏi "why chat memory dont update latest chat": log proxy cho thấy
TẤT CẢ session thật (sau turn đầu) đều in `[cc-routing] skip L0 write for kind=fork`,
dù session đã `status=initialized` đúng team/agent.

**Root cause:** `MemoryProxy/src/common/cc-request-classifier.ts` phân loại request
thành `main`/`fork`/`sidequery` dựa trên vị trí marker `cache_control` cuối cùng trong
`messages[]` — marker ở `n-2` (áp út) → `fork`. Heuristic này được viết cho hành vi
caching CŨ của Claude Code (chỉ marker lệch khi SUGGESTION/RECAP/COMPACT có
`skipCacheWrite=true`). Nhưng với Claude Code hiện tại (v2.1.317), **prompt-caching
chuẩn cho MỌI hội thoại tiếp diễn** (turn 2+) đặt marker ở cuối phần đã-cache (= `n-2`,
vì message mới nhất `n-1` chưa được cache) — verify bằng cả giả lập (curl) và đối chiếu
log session thật: 100% khớp. Tức là **mọi turn thật từ turn 2 trở đi bị coi là "fork"**,
không phải edge-case hiếm.

`requestKind === "fork"` → `isMainDialog = false` → cả L0 write và skill-buffer bị
`skip` thẳng (`MemoryProxy/src/pipeline/runners/anthropic.ts` dòng ~1634/1995, biến
`memoryTurn`/`isMainDialog`).

**Fix (đúng kiến trúc — không tắt gate bảo vệ, chỉ sửa điều kiện bị lỗi):**
Chỉ exclude `sidequery` (title-gen/verify-key — nhận diện chắc chắn qua
`tools=[] && thinking.disabled`, không phải dialog thật), không còn dựa vào phân biệt
`main` vs `fork` (không đáng tin với CC version hiện tại) để quyết định ghi nhớ:

```bash
docker exec tdai-proxy node -e '
  const fs = require("fs");
  const p = "/app/src/pipeline/runners/anthropic.ts";
  let c = fs.readFileSync(p, "utf8");
  c = c.replace(
    `const memoryTurn = requestKind === "main" && !legacyProxy;`,
    `const memoryTurn = requestKind !== "sidequery" && !legacyProxy;`
  );
  c = c.replace(
    `const isMainDialog = ctx.requestKind === "main";`,
    `const isMainDialog = ctx.requestKind !== "sidequery";`
  );
  fs.writeFileSync(p, c);
'
docker restart tdai-proxy
```

Verify: dựng 1 session hoàn toàn mới qua đúng handshake (pending_asset_confirm →
pending_team_select → initialized) bằng curl độc lập (không đụng session thật nào của
user), gửi turn 2 với shape marker-ở-`n-2` → log in `[cc-routing] ... kind=fork` NHƯNG
`tdai-recorder:write-l0` vẫn chạy — xác nhận fix đúng.

⚠️ Cùng caveat như patch #3 — **không bền**, mất nếu container bị recreate. Cả 2 patch
(accept-encoding + memoryTurn/isMainDialog) cần áp lại cùng nhau sau mỗi lần
`docker rm tdai-proxy && ./start-proxy.sh` hoặc `./start-all.sh` full rerun.

## Bug #5: Picker AskUserQuestion không nhận diện câu trả lời trong môi trường thật

Sau khi fix #4, test thực tế vẫn gặp `[session-init:cc] ... asset-confirm unrecognized,
bypassing` — proxy đọc `lastUserText` lại là nội dung `<system-reminder>` (CLAUDE.md +
memory + gitStatus mà Claude Code tự chèn vào MỌI message), không phải câu trả lời
AskUserQuestion thật. Môi trường test của tôi (curl tay) không có các system-reminder
này nên không lộ ra bug. Chưa pin được chính xác tại sao `.includes(ASSET_CONFIRM_YES)`
(không giới hạn độ dài, xem `extractor.ts`) vẫn fail — cần raw body thật từ
`claude --debug` để điều tra tiếp nếu muốn vá đúng chỗ.

**Giải pháp áp dụng — né hẳn, không vá parser:** vì user chỉ có 1 team hữu dụng
(`personal-lab`) + 1 agent (`Agent Engineer`), dùng tính năng **account-level session
default** có sẵn (ưu tiên cao nhất, cao hơn cả form tương tác — xem
`MemoryProxy/src/session/user-default.ts`):

```bash
ADMIN_KEY=$(cat deploy/global-images/.admin-key)
curl -X POST http://localhost:8420/v3/meta/user-session-default/set \
  -H "x-tdai-user-key: $ADMIN_KEY" -H "x-tdai-service-id: default" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"usr-6ytr3op2hm","team_id":"team-6zfb4nyjbk","agent_id":"agt-6zj268h0ua","task_id":"default"}'
```

Kết quả: **mọi session Claude Code mới tự động `→ initialized` ngay từ message đầu**,
không hỏi gì, không cần parse text gì cả — verify bằng session hoàn toàn mới: log in
thẳng `[session-init:user-default] ... applied team=... agent=... task=default` rồi
`write-l0` ngay. Đây là fix bền hơn hẳn 2 patch container — **lưu trong memory-core
(DB thật), không mất khi container bị recreate.**

(Phụ, không còn cần thiết sau fix này nhưng vẫn giữ: `sessionInit.skipAssetConfirm:
true` đã thêm vào `deploy/global-images/.proxy-config/config.yaml` — file này bị
`start-proxy.sh` ghi đè mỗi lần chạy lại script đó, nên **sẽ mất** nếu rerun; không
cần thêm lại vì account-default đã giải quyết tận gốc.)

## Bug #6: Title-gen (sidequery) bị ghi nhầm vào L0 — tác dụng phụ của fix #4

Sau fix #4 + #5, phát hiện Claude Code's title-generation request (prompt chuẩn
"Write the title in the predominant language of the session...") bị ghi vào L0 làm
rác chat memory (vd nội dung `{"title": "Enterprise architecture"}`).

**Root cause:** `classifyCcRequest` check `cache_control` marker position TRƯỚC khi
check điều kiện `tools=[] && thinking.disabled` (dấu hiệu sidequery đáng tin cậy hơn).
Title-gen request vẫn mang theo marker tồn lại từ history → bị phân loại nhầm
`main`/`fork` thay vì `sidequery`, nên lọt qua gate `requestKind !== "sidequery"` của
fix #4.

**Fix:** đảo thứ tự check trong `cc-request-classifier.ts` — kiểm tra điều kiện
`sidequery` (tools empty + thinking disabled) TRƯỚC, chỉ fallback sang marker-position
check khi không phải sidequery:

```bash
docker exec tdai-proxy node -e '
  const fs = require("fs");
  const p = "/app/src/common/cc-request-classifier.ts";
  let c = fs.readFileSync(p, "utf8");
  // di chuyển block "const toolsEmpty = ... if (toolsEmpty && thinkingOff) return sidequery;"
  // lên TRƯỚC block "if (markerIdx >= 0) { ... }" — xem full diff trong git/patch history
'
docker restart tdai-proxy
```

Verify: giả lập đúng shape (marker + tools=[] + thinking disabled) → `kind=sidequery`,
`skip L0 write for kind=sidequery` — đúng.

Đã dọn 5 bản ghi rác title-gen cũ (session thật + session test) khỏi L0 bằng
`POST /v3/conversation/delete` với `message_ids`.

⚠️ Patch #4/#5(container)/#6 đều KHÔNG bền (mất khi container recreate). Patch #5
(account-session-default, lưu trong memory-core DB) và #2/#3 (DeepSeek-side, không
liên quan container) thì BỀN. Khi cần tái tạo lại full stack, áp lại patch #1+#4+#6
(container) theo đúng thứ tự: #1 (accept-encoding) → #4 (memoryTurn/isMainDialog) →
#6 (classifier reorder) → restart; #5 (account-default) có thể set lại bất cứ lúc nào
độc lập (chỉ cần memory-core đang chạy, không phụ thuộc container nào bị patch).

## Bug #7 — OpenCode (openai-chat protocol) 404 → 401 do thiếu upstream.agents override

**Triệu chứng:** gọi `POST /opencode/default/v1/chat/completions` (đúng route theo
`adapters/opencode/README.md`) trả về `404` với response header mang dấu CloudFront
(`via: ...cloudfront.net`, `x-cache: Error from cloudfront`) — nghĩa là request ĐÃ
được forward lên upstream thật (DeepSeek), chỉ sai path.

**Root cause:** `config.upstream.url` đang trỏ `https://api.deepseek.com/anthropic`
(đúng cho Claude Code, protocol `anthropic`). Nhưng OpenCode dùng protocol
`openai-chat`, và route openai-chat luôn ghép `defaultUpstreamUrl + "/chat/completions"`
(xem `resolve-target-full.ts`). Không có entry riêng trong `upstream.agents` cho
`opencode` → fallback về `upstream.url` chung → ra
`.../anthropic/chat/completions`, không tồn tại trên DeepSeek → 404.

**Fix (container-config, KHÔNG bền — mất khi `start-proxy.sh`/`start-all.sh` rerun
vì file có header "tự sinh, đừng sửa tay"):** thêm vào
`deploy/global-images/.proxy-config/config.yaml`:
```yaml
upstream:
  agents:
    opencode:
      url: "https://api.deepseek.com/v1"
      apiKey: "<giá trị PROXY_UPSTREAM_API_KEY trong .env>"
```
rồi `docker restart tdai-proxy` (restart thường — KHÔNG `rm`/recreate — để giữ 3 patch
container khác còn sống).

**Lưu ý thứ 2 (bug lồng trong bug):** nếu chỉ set `url` mà quên `apiKey`, theo đúng
3-case fallback trong `AgentUpstreamEntry` doc (`types.ts`), proxy sẽ **passthrough
nguyên api key của client** (ở đây là user_key `sk-mem-...` nội bộ) thẳng lên DeepSeek
→ DeepSeek trả `401 invalid api key` vì nó không hiểu key dạng `sk-mem-...`. Phải set
cả `url` **và** `apiKey` để proxy dùng server-side DeepSeek key thật.

**Verify:** `curl -X POST http://127.0.0.1:8096/opencode/default/v1/chat/completions`
với `Authorization: Bearer <user_key sk-mem-...>` + `x-tdai-service-id: default` +
body OpenAI chat-completions format → `200`, nhận lại `"content":"pong"` thật từ
DeepSeek.

**Bất kỳ agent `openai-chat` khác (`codebuddy`, `dsh`) cũng sẽ dính bug tương tự** nếu
sau này dùng — áp cùng pattern (`upstream.agents.<agent>.url` + `.apiKey` trỏ
DeepSeek OpenAI-compatible base) trước khi test, đừng đợi 404 rồi mới sửa.

### Setup OpenCode CLI client — các bước đã làm

1. `POST /v3/meta/user-key/create` (auth bằng admin key qua header `x-tdai-user-key`,
   KHÔNG qua `Authorization: Bearer`) → tạo `user_key` riêng tên `opencode-terminal`
   cho user admin hiện có (chỉ có 1 user trong hệ thống — cùng user đang giữ
   account-session-default của Claude Code, nên OpenCode tự bind theo cùng
   team/agent/task, không hiện picker). Key value chỉ hiện ra đúng 1 lần lúc tạo
   (`data.key_value`) — không lưu lại plaintext ở đâu khác ngoài `~/.zshrc` (env var)
   và client secret store của OpenCode.
2. Merge provider `tencentdb-agent-memory` (npm `@ai-sdk/openai-compatible`,
   `baseURL: http://127.0.0.1:8096/opencode/default/v1`, header
   `x-tdai-service-id: default`, model id = `PROXY_UPSTREAM_MODEL` =
   `deepseek-v4-pro`) vào `~/.config/opencode/opencode.jsonc` hiện có — giữ nguyên
   `litellm`/`openrouter` providers cũ, không đổi `model` default.
3. `apiKey` của provider lấy qua `{env:TDAI_MEMORY_KEY}` — set
   `export TDAI_MEMORY_KEY="sk-mem-..."` trong `~/.zshrc` (việc này user tự chạy,
   Claude Code bị auto-mode chặn ghi secret vào shell profile — "Unauthorized
   Persistence").
4. Fix bug #7 trên, verify bằng curl giả lập request OpenCode → 200 pong.

## Fallback đã chuẩn bị (theo yêu cầu "luôn chuẩn bị phương án fallback")

- Nếu DeepSeek key hết hạn/hết quota: đổi `MEMORY_LLM_*` và `PROXY_UPSTREAM_*` trong
  `.env` sang provider khác (Anthropic cần `MEMORY_LLM_PROTOCOL=anthropic`; OpenAI giữ
  `openai`), chạy lại `start-all.sh`. Hai nhóm có thể dùng provider khác nhau — memory
  group không nhất thiết phải cùng provider với proxy group.
- Nếu port xung đột (8420/8125/8424/8096 đã bị chiếm): sửa `*_PORT` trong `.env` trước
  khi chạy, script tự kiểm tra và báo lỗi sớm (`check_ports`) thay vì fail giữa chừng.
- Nếu Docker Hub pull chậm/fail: không có mirror công khai ngoài Tencent nội bộ — chỉ
  còn cách retry hoặc build image từ source trong repo (chưa thử, chưa cần).

## Bug #8 — L1/L2/L3 memory content ra tiếng Trung dù hệ thống đã có "match source
language" instruction

**Triệu chứng:** nội dung memory ở Panel (L1 atomic facts, L2 scene, L3 persona) ra
tiếng Trung, mặc dù chat thật (L0) là tiếng Việt/Anh.

**Root cause:** 4 file prompt chịu trách nhiệm (`MemoryCore/src/core/prompts/
l1-extraction.ts`, `l1-dedup.ts`, `scene-extraction.ts`, `persona-generation.ts`,
chạy trong container `tdai-memory-core`, KHÔNG phải `tdai-proxy`) đều ĐÃ có sẵn chỉ
dẫn "输出语言：...使用与用户消息相同的语言" (output language = match user's message
language) — thiết kế đúng, nhưng chỉ dẫn này nằm giữa hàng chục dòng tiếng Trung khác,
LLM (deepseek-flash qua MEMORY_LLM_*) bị "priming" theo ngôn ngữ chủ đạo của prompt và
không theo chỉ dẫn match-language một cách ổn định.

**Fix (container-config trên `tdai-memory-core`, KHÔNG bền — mất khi container
recreate):** thêm 1 hằng `ENGLISH_OUTPUT_OVERRIDE` ở cấp top-level mỗi file, append vào
cuối giá trị trả về của hàm chọn system prompt (`getExtractMemoriesSystemPrompt`,
`getConflictDetectionSystemPrompt`, `getSceneSystemPrompt`, và field `systemPrompt`
trong `buildPersonaPrompt`) — ép buộc output tiếng Anh bất kể ngôn ngữ nguồn, không cần
dịch lại toàn bộ prompt tiếng Trung (tránh rủi ro dịch sai làm hỏng logic extraction).

⚠️ Lúc patch, 1 lần đầu đặt `const` sai vị trí (giữa object literal trong
`persona-generation.ts`) làm container crash ngay khi start (`esbuild Transform
failed`, `Expected ":" but found "ENGLISH_OUTPUT_OVERRIDE"`). Vì `/app/src` không
bind-mount (chỉ data volume + 1 file config mount), sửa file bằng `docker cp` ra ngoài
→ sửa → `docker cp` lại vào, rồi `docker start` lại (không dùng `docker exec` được khi
container đã exited).

**Chưa verify end-to-end bằng data thật** — vì MEMORY_LLM_* hiện cũng dùng chung
DeepSeek key đang $0 balance (xem Bug #7), nên L1/L2/L3 generation thật có thể đang bị
block bởi lý do khác (hết tiền), không phải do prompt. Cần nạp DeepSeek (hoặc đổi
MEMORY_LLM_* sang provider khác đang có tiền, ví dụ Anthropic/Gemini key đã có sẵn
trong environment) rồi tạo thêm vài lượt chat thật để quan sát L1/L2/L3 mới có ra
tiếng Anh đúng như mong đợi không.
