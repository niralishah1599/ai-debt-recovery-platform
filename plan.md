You are a **Senior System Architect** responsible for planning the implementation of an **AI Debt Recovery Platform MVP**.

Follow these rules strictly:

* The **MVP Build Plan** is the single source of truth.
* Do NOT introduce features outside the MVP scope.
* Respect the architecture and constraints defined in `plan.md`.
* Focus on **clean, minimal implementation** that satisfies the acceptance criteria.

The system must follow **Next.js (App Router) + Supabase (PostgreSQL + Auth)** architecture and be deployable on **Vercel**.

---

# Login System

The platform must support **three login roles**.

### 1. Staff (Admin / Operations)

Staff users manage the internal system.

Capabilities:

* create clients
* create debtor records
* create accounts
* manage campaigns
* trigger communications
* view analytics
* manage compliance rules

Staff access the **internal operations interface**.

Example routes:

/staff/dashboard
/staff/debtors
/staff/accounts
/staff/campaigns
/staff/analytics

---

### 2. Client Users

Client users belong to a **creditor organization**.

Capabilities:

* login to client portal
* view portfolio summary
* view debtor accounts linked to their client
* view payments received
* view campaign activity
* view compliance incidents

Client users access the **read-only client portal**.

Example routes:

/client/dashboard
/client/accounts
/client/payments
/client/campaigns

Client users must **only see their own client’s data**.

---

### 3. Debtor Users

Debtors are the individuals who owe money.

Capabilities:

* login to debtor portal
* view their debt accounts
* see account balances
* view payment history
* complete one-time payments

Debtors access the **Debtor Portal**.

Example routes:

/debtor/dashboard
/debtor/accounts
/debtor/payments

Debtors must only see **their own account data**.

---

# Database Model (Updated for Login)

Entities required:

Client
PortalUser
Debtor
Account
Campaign
Message
Payment
ComplianceRule
ComplianceEvent

PortalUser roles:

staff
client
debtor

Example structure:

PortalUser

* id
* email
* role (staff | client | debtor)
* client_id (nullable)
* debtor_id (nullable)
* created_at

Client

* id
* name
* created_at

Debtor

* id
* name
* email
* phone
* client_id
* created_at

Account

* id
* debtor_id
* client_id
* balance
* status
* created_at

Payment

* id
* account_id
* amount
* payment_status
* payment_date

---

# Security Requirements

Use **Supabase Auth**.

Role rules:

Staff

* full system access

Client

* can access rows where client_id = their client

Debtor

* can access rows where debtor_id = their user

Implement **Row Level Security (RLS)** to enforce these restrictions.

---

# Product Interfaces

Internal Operations Interface

* staff dashboard
* debtor/account management
* campaign management
* analytics

Client Portal

* portfolio view
* payments view
* campaign summary

Debtor Portal

* account list
* payment history
* payment page

---

# Required API Groups

/auth
/clients
/debtors
/accounts
/campaigns
/messages
/payments
/compliance
/analytics
/client-portal
/debtor-portal

---

# Implementation Phases

Create a step-by-step implementation plan using these phases.

Phase 1
Base project setup + authentication system

Phase 2
Client, debtor, and account data model

Phase 3
Campaign management for email and SMS

Phase 4
Compliance validation engine

Phase 5
Analytics dashboard

Phase 6
Client portal views

Phase 7
Debtor portal views

Phase 8
Payment processing system

Each phase must include:

* database schema changes
* backend services
* API routes
* frontend pages
* security implementation
* testing checklist

---

# Execution Status

Status date: 2026-03-14

Phase 1: Base project setup + authentication system

* Status: COMPLETED
* Scope completed:
  * Supabase Auth integration
  * Login/register/callback/signout flows
  * Protected dashboard entrypoint
  * Role-aware portal user profile foundation

Phase 2: Client, debtor, and account data model

* Status: COMPLETED
* Scope completed:
  * Staff CRUD for clients
  * Staff CRUD for debtors
  * Staff CRUD for accounts
  * Staff dashboard metrics for core records
  * Staff-only APIs for clients, debtors, and accounts

Phase 3: Campaign management for email and SMS

* Status: COMPLETED
* Scope completed:
  * Staff campaign creation for email and SMS
  * Staff-triggered campaign execution against selected active accounts
  * Message history tracking for campaign sends
  * Staff-only APIs for campaigns and message history
  * Campaign/message query indexes applied in Supabase

Phase 4: Compliance validation engine

* Status: COMPLETED
* Scope completed:
  * Rule-based compliance checks integrated into campaign execution
  * Allowed and blocked compliance events recorded for each active rule evaluation
  * Staff rule management for compliance rules
  * Staff compliance event review surface
  * Debtor consent, timezone, and contact-window preferences added for compliance evaluation

Phase 5: Analytics dashboard

* Status: COMPLETED
* Scope completed:
  * Staff analytics dashboard for portfolio, payment, communication, and compliance metrics
  * Derived collection and delivery rate calculations from existing MVP data
  * Seven-day activity summaries for payments, messages, and compliance blocks
  * Staff-only analytics API endpoint

Phase 6: Client portal views

* Status: COMPLETED
* Scope completed:
  * Read-only client portal dashboard
  * Client portfolio accounts view
  * Client payments view
  * Client campaign activity and compliance visibility
  * Client-portal read APIs for summary, accounts, payments, and campaigns

Phase 7: Debtor portal views

* Status: COMPLETED
* Scope completed:
  * Debtor portal dashboard
  * Debtor account list view
  * Debtor payment history view
  * Debtor-portal read APIs for summary, accounts, and payments
  * Debtor communication visibility on the dashboard

Phase 8 and beyond

* Status: NOT STARTED
* Rule: Do not start Phase 8 until explicit user approval is provided.
* Required prompt before continuing:
  * "Phase complete. Should I proceed to the next phase?"

---

# Output Requirements

Generate a **clear architecture and implementation plan** including:

1. system architecture
2. database schema
3. folder structure
4. API design
5. UI surfaces
6. phase-by-phase development plan

Do NOT generate code yet.

Only generate the **architecture and execution plan for the MVP with login system and debtor portal**.
