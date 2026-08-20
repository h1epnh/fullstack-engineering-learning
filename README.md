# Fullstack Engineering Learning Hub

A comprehensive repository for learning and mastering full-stack engineering concepts, ranging from microservices and mobile development to DevOps and AI.

## 📂 Project Structure

The repository is organized by domain:

### 🔧 Backend (`/backend`)
*   **Languages**: Java, Python, Go, Node.js.
*   **Key Projects**:
    *   **Microservices Saga Pattern** (`/backend/projects/microservices/saga-pattern`): A Spring Boot skeleton for learning distributed transactions (Order, Customer, Inventory services).
    *   **Node.js Projects**: Various Express and NestJS implementations.

### 📱 Frontend (`/frontend`)
*   **Frameworks**: React, React Native, Next.js.
*   **Key Projects**:
    *   **Obytes Hello Project** (`/frontend/react/obytes/obytes-hello-project`): A production-grade **Nail Salon Management System**.
        *   **Stack**: React Native (Expo), TypeScript, NativeWind, React Query, Zustand.
        *   **Backend**: Node.js, Express, Prisma, PostgreSQL.

### ☁️ DevOps (`/devops`)
*   Docker, Kubernetes, CI/CD pipelines, cloud, monitoring, event-driven, and databases (Redis, Postgres, Oracle) setup/ops.

### 🏛️ Architecture (`/architecture`)
*   Enterprise architecture frameworks: TOGAF (fully documented — see `architecture/TOGAF/MASTER_PLAN.md`), COBIT, ITIL.

### 🧠 AI & Data (`/ai`, `/data`)
*   Exploration of AI models/agents (e.g. `ai/openhands` — self-hosted agent UI), data engineering pipelines, and ML concepts.

### 🧪 Proof of Concepts (`/poc`)
*   Standalone experiments and demos (Stripe payments, JWT generators, Strapi CMS, Google Maps scraping, etc.) — not meant to be production patterns like `/backend/projects`.

### 🧯 Testing (`/testing`)
*   Cross-cutting testing resources (e.g. performance testing).

### 🛠 Vendored Tools (`/tools`)
*   Third-party tools cloned as git submodules for local use (security, messaging, orchestration, workflow, analytics). **Not authored here** — see `tools/README.md` before editing anything inside.

### 🛡️ Security (`/devops/security`, `/tools/security`)
*   Authored security learning material lives under `devops/security`; vendored security tools (MobSF, PhoneSploit...) live under `tools/security`.

---

## 🛠 Technology Stack Highlights

| Domain | Technologies |
| :--- | :--- |
| **Backend** | Java (Spring Boot), Node.js (Express/NestJS), Python (FastAPI/Django), Go |
| **Frontend** | React, React Native (Expo), TypeScript, Tailwind CSS |
| **Database** | PostgreSQL, MongoDB, Redis |
| **DevOps** | Docker, Kubernetes, GitHub Actions |
| **Tools** | Maven, pnpm, Swagger/OpenAPI |

## 🚀 Getting Started

1.  **Explore a Domain**: Navigate to the folder of interest (e.g., `cd frontend/react`).
2.  **Check Project READMEs**: Each sub-project typically has its own `README.md` with specific setup instructions.
3.  **Run the Obytes Project**:
    ```bash
    cd frontend/react/obytes/obytes-hello-project
    pnpm install
    pnpm start
    ```