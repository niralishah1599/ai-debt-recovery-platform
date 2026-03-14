# NextGen AI Debt Recovery Platform

An enterprise-grade, AI-powered debt recovery SaaS platform built with Next.js 16 and Supabase. Designed for compliance-first, multi-channel debt collection with role-based portals for staff, creditor clients, and debtors.

---

## Features

- **Multi-Channel Campaign Engine** — Automated SMS and email outreach with configurable sequences
- **Compliance Validation** — Built-in compliance rules engine with full audit trail on every campaign send
- **Three-Role Portal System** — Scoped access for staff (admin), clients (creditors), and debtors (borrowers)
- **Real-Time Payment Processing** — Debtors submit payments that instantly update balances across all portals
- **Analytics Dashboard** — Recovery rate, campaign performance, and portfolio health metrics
- **Borrower-First UX** — Clean debtor portal for account visibility and self-service payments

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| Language | TypeScript 5 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase GoTrue (JWT, cookie-based SSR sessions) |
| Styling | CSS custom properties (design token system) |
| Fonts | Outfit + JetBrains Mono (Google Fonts) |
| Deployment | Vercel |

---

## Role System

| Role | Access |
|---|---|
| **Staff** | Full platform — clients, debtors, accounts, campaigns, compliance, analytics |
| **Client** | Scoped portfolio view — own accounts, campaigns, payment history |
| **Debtor** | Personal portal — own accounts, payment submission, message history |

---

## Project Structure

```
ai-debt-recovery-platform/
├── app/
│   ├── (auth)/              # Login and registration pages
│   │   ├── login/
│   │   └── register/
│   ├── (marketing)/         # Public landing page
│   ├── (workspace)/         # Authenticated portals
│   │   ├── staff/           # Staff modules
│   │   │   ├── dashboard/
│   │   │   ├── accounts/
│   │   │   ├── campaigns/
│   │   │   ├── clients/
│   │   │   ├── compliance/
│   │   │   ├── debtors/
│   │   │   └── analytics/
│   │   ├── client/          # Client (creditor) portal
│   │   │   ├── dashboard/
│   │   │   ├── accounts/
│   │   │   ├── campaigns/
│   │   │   └── payments/
│   │   └── debtor/          # Debtor (borrower) portal
│   │       ├── dashboard/
│   │       ├── accounts/
│   │       └── payments/
│   └── api/                 # REST API routes
├── components/
│   ├── auth/                # Auth shell and form components
│   └── workspace/           # Sidebar, topbar, portal shell
├── services/                # Business logic layer
├── lib/
│   └── supabase/            # Supabase client (browser + server)
├── utils/                   # Formatting helpers, env config
└── supabase/
    ├── migrations/          # Ordered SQL migrations
    └── seed.sql
```

---

## Database Schema

Core tables managed via Supabase migrations:

| Table | Purpose |
|---|---|
| `portal_users` | Links `auth.users` to roles (staff / client / debtor) |
| `clients` | Creditor organisations |
| `debtors` | Individual borrower profiles |
| `accounts` | Debt accounts linking debtors to clients with balance tracking |
| `campaigns` | SMS/email campaign definitions |
| `messages` | Individual outreach message records per debtor/campaign |
| `payments` | Payment transactions with status and reference |
| `compliance_rules` | Configurable compliance validation rules |
| `compliance_events` | Audit log of every compliance check |

Row-Level Security (RLS) is enforced on all tables. Clients see only their own portfolio; debtors see only their own accounts.

### Key Database Functions

| Function | Description |
|---|---|
| `current_portal_debtor_id()` | Returns the authenticated debtor's ID from session context |
| `process_debtor_payment(account_id, amount, reference)` | Security definer function — atomically records payment and updates account balance, bypassing RLS safely |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- Supabase CLI (`npm install -g supabase`)

### 1. Clone and install

```bash
git clone <repo-url>
cd ai-debt-recovery-platform
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

> **Note:** If your database password contains special characters (e.g. `@`), URL-encode them in `DATABASE_URL` (e.g. `@` → `%40`).

### 3. Apply migrations

```bash
npx supabase db push --db-url "$DATABASE_URL"
```

This runs all migrations in `supabase/migrations/` in order, creating the full schema, RLS policies, seed data, and stored functions.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Seed Accounts

After running migrations, the following test accounts are available:

| Email | Password | Role |
|---|---|---|
| `staff@example.com` | `password123` | Staff |
| `client@example.com` | `password123` | Client |
| `debtor@example.com` | `password123` | Debtor |

> Seed credentials are defined in `supabase/migrations/20260314123000_seed_mvp_data.sql`.

---

## Payment Flow

Payments are processed entirely server-side without a third-party payment processor:

1. Debtor selects an active account and enters an amount
2. `submitPaymentAction` (Next.js Server Action) calls `supabase.rpc("process_debtor_payment", ...)`
3. The PostgreSQL `process_debtor_payment` function (security definer):
   - Verifies debtor ownership of the account
   - Validates account is active and amount does not exceed balance
   - Atomically inserts a `payments` record with `status = succeeded`
   - Updates `accounts.balance`; sets `status = paid` if balance reaches zero
4. Client and staff portals reflect updated balances on next page load (no extra code needed — queries run live)

---

## Security

- All authenticated routes are protected by `requirePortalRole()` server-side checks
- RLS policies prevent cross-tenant data access at the database level
- The `process_debtor_payment` function uses `SECURITY DEFINER` to safely update account balances without granting debtors direct `UPDATE` privileges on the `accounts` table
- Card information entered in the payment form is UI-only and is not transmitted or stored

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## License

Private — all rights reserved.
