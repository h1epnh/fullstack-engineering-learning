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
*   `frontend/react/` — currently empty scaffold, no active project.

### ☁️ DevOps (`engineering/devops`)
*   Docker, Kubernetes, CI/CD pipelines, cloud, monitoring, event-driven, and databases (Redis, Postgres, Oracle) setup/ops.

### 🧠 AI & Data (`engineering/ai`, `engineering/data`)
*   Exploration of AI models/agents (e.g. `ai/openhands` — self-hosted agent UI), data engineering pipelines, and ML concepts.

### 📚 Docs (`engineering/docs`)
*   Reference material not tied to a runnable project (e.g. curated interview-prep summaries).

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

*   `.circleci/config.yml` references `engineering/devops/projects/simple-lab/app`, a project deleted
    long ago (commit `d49ff40e`). The path prefix is kept consistent with the current layout, but the
    job itself has been broken since that deletion and needs either restoring the project or removing
    the job.
*   `engineering/poc/VISA/` has private keys and shared-secret files committed to git
    (`private_key.pem`, `public_key.pem`, `visa_cert.pem`, `di-bank-uat/privateKey.pem`,
    `di-bank-uat/decrypted_shared_secret.txt`, `di-bank-uat/encrypted_shared_secret.txt`,
    `di-bank-uat/ISS_KEY.txt`). Even if these are UAT sandbox credentials, review and consider
    removing them from history.
