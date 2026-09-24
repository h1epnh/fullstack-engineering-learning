# Learning Hub

Personal learning monorepo, split into two top-level clusters by kind of content:

- **[`engineering/`](engineering/)** — hands-on software engineering: code, infra, experiments.
- **[`business/`](business/)** — career/professional development: MBA self-study, enterprise
  architecture frameworks (TOGAF/COBIT/ITIL/SAFe). No code, no shared tooling with `engineering/`.

## 📂 `engineering/` — Project Structure

### 🔧 Backend (`engineering/backend`)
*   **Languages**: Java, Go, Node.js.
*   `backend/golang/`, `backend/java/` — architecture-pattern templates (Clean Architecture, DDD, Onion).
*   `backend/projects/` — real domain projects, organized by domain (auth, payment, microservices),
    language incidental (Go for auth/payment, Java for the microservices saga-pattern skeleton).

### 📱 Frontend (`engineering/frontend`)
*   `frontend/projects/ewallet-lab/` — microfrontend (Module Federation) web client for
    `backend/projects/ewallet-lab`, one micro-app per backend service. See its `DESIGN.md`.

### ☁️ DevOps (`engineering/devops`)
*   Docker, Kubernetes, CI/CD pipelines, cloud, monitoring, event-driven, and databases (Redis, Postgres, Oracle) setup/ops.

### 🧠 AI & Data (`engineering/ai`, `engineering/data`)
*   Exploration of AI models/agents (e.g. `ai/openhands` — self-hosted agent UI), data engineering pipelines, and ML concepts.

### 📚 Docs (`engineering/docs`)
*   Reference material not tied to a runnable project (e.g. curated interview-prep summaries).
*   Exception: `docs/ewallet-lab/` is a small React+Vite developer-portal site (its own
    `npm install && npm run build`) documenting `backend/projects/ewallet-lab` and
    `frontend/projects/ewallet-lab` — kept here rather than under `frontend/projects/` since it's
    reference material about those projects, not part of the product itself.

### 🧪 Proof of Concepts (`engineering/poc`)
*   Standalone experiments and demos (Stripe payments, JWT generators, Strapi CMS, Google Maps scraping, etc.) — not meant to be production patterns like `backend/projects`.

### 🧯 Testing (`engineering/testing`)
*   Cross-cutting testing resources (e.g. performance testing).

### 🛠 Vendored Tools (`engineering/tools`)
*   Third-party tools vendored as plain copies for local use (security, messaging, workflow, analytics). **Not authored here** — see `engineering/tools/README.md` before editing anything inside.

### 🛡️ Security (`engineering/devops/security`, `engineering/tools/security`)
*   Authored security learning material lives under `devops/security`; vendored security tools (MobSF, PhoneSploit...) live under `tools/security`.

---

## 📂 `business/` — Structure

*   **[`MBA/`](business/MBA/)** — self-study MBA (Banking & Finance Management track), organized by topic.
*   **[`Courses/`](business/Courses/)** — supplementary video courses (e.g. QTKD 1/2).
*   **[`architecture/`](business/architecture/)** — enterprise architecture / IT governance frameworks: TOGAF (fully documented, see `business/architecture/TOGAF/MASTER_PLAN.md`), COBIT, ITIL, SAFe.

---

## 🛠 Technology Stack Highlights (engineering/)

| Domain | Technologies |
| :--- | :--- |
| **Backend** | Java (Spring Boot), Node.js (Express/NestJS), Python (FastAPI/Django), Go |
| **Frontend** | React, React Native (Expo), TypeScript, Tailwind CSS |
| **Database** | PostgreSQL, MongoDB, Redis |
| **DevOps** | Docker, Kubernetes, GitHub Actions |
| **Tools** | Maven, pnpm, Swagger/OpenAPI |

## 🚀 Getting Started

1.  **Explore a domain**: Navigate to the folder of interest (e.g., `cd engineering/backend`).
2.  **Check project READMEs**: Each sub-project typically has its own `README.md` with specific setup instructions.

## ⚠️ Known issues

*   `engineering/poc/VISA/` has private keys and shared-secret files committed to git
    (`private_key.pem`, `public_key.pem`, `visa_cert.pem`, `di-bank-uat/privateKey.pem`,
    `di-bank-uat/decrypted_shared_secret.txt`, `di-bank-uat/encrypted_shared_secret.txt`,
    `di-bank-uat/ISS_KEY.txt`). Even if these are UAT sandbox credentials, review and consider
    removing them from history.
*   `engineering/poc/StripePaymentDemo`'s sibling `backend/projects/payment/stripe-go-service/stripe.go`
    hardcodes a Stripe **test** secret key inline instead of reading it from an env var — low risk
    (test-mode key, can't move real money) but still bad practice to copy from.
*   `backend/projects/auth/rbac/rbac-go-service` ships `rbac_model.conf`/`rbac_policy.csv` (Casbin
    config) but no Go file actually imports `casbin` — the RBAC engine was never wired into code
    (confirmed: `go mod tidy` dropped `casbin/casbin/v2`, `casbin/govaluate`, `bmatcuk/doublestar/v4`
    as unused). Scaffold, not a working RBAC service yet.
*   `backend/projects/auth/mfa/mfa-go-service` doesn't compile as-is: `cmd/server/main.go`,
    `internal/config/config.go`, `internal/handlers/auth.go` are empty (0 lines), and the root
    package has two conflicting `main()` entry points (`main.go` and `generate_otp.go` both declare
    `package main` with duplicate symbols). Pre-existing, unrelated to the 2026-09-20 dependency
    cleanup below.

## 🧹 2026-09-20 outdated-stack cleanup

*   Removed `.circleci/config.yml` entirely — its only job referenced
    `devops/projects/simple-lab/app`, deleted since commit `d49ff40e`; fixing the path wouldn't have
    made the job run.
*   Replaced the archived/deprecated `github.com/dgrijalva/jwt-go` with the maintained
    `github.com/golang-jwt/jwt/v4` fork in `mfa-go-service` and `rbac-go-service` (near drop-in, same
    `jwt.StandardClaims`/`NewWithClaims`/`ParseWithClaims` API) — `dgrijalva/jwt-go` has a known
    algorithm-confusion advisory and is unmaintained.
*   Bumped `stripe-go-service` from `stripe-go/v72` (tagged 2022) to `v83.2.1` (latest) — builds clean,
    tiny API surface (`PaymentIntentParams`/`Int64`/`String`) unaffected by the jump.
*   Bumped the `go` directive from the EOL `1.21.4` to `1.26.0` across all 4 Go modules
    (`common-sample`, `stripe-go-service`, `rbac-go-service`, `mfa-go-service`) — all verified to
    still build.
*   Removed two dead empty directories left over from earlier restructuring: root `databases/`
    (superseded by `devops/databases/`) and `tools/orchestration/` (its content, `orchestration/container`,
    was removed for size per `tools/README.md`).
*   Fixed `tools/README.md`: dropped a `feature-flags/unleash` row pointing at a path that doesn't
    exist under `tools/` (unleash actually lives at `devops/monitoring/unleash`, gitignored); noted
    Redash's real status — community-maintenance mode since the 2020 Databricks acquisition, last
    major release (v10) in late 2021.
*   Fixed a pre-existing path bug in `.github/workflows/ci.yml` (missing `pipelines/` segment) while
    updating it for the `engineering/` prefix.
