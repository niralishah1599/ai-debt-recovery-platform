# AGENTS.md

## Purpose

This repository is implemented strictly according to **`plan.md`**.

`plan.md` is the **single source of truth** for:

* product scope
* system architecture
* MVP features
* data model
* implementation order
* acceptance criteria

AI agents and developers **must follow `plan.md` exactly**.

If any instruction conflicts with `plan.md`, **`plan.md` always takes priority**.

---

# Mandatory Rule

Before implementing any feature, agents must:

1. Read **`plan.md`**
2. Verify the feature exists in the MVP scope
3. Implement only what is defined in the plan

If the requested work is **not present in `plan.md`**, the agent must:

* refuse implementation
* explain that the feature is outside the MVP scope

---

# Allowed Work

Agents may only implement functionality explicitly defined in **`plan.md`**, including:

* debtor management
* account management
* email and SMS campaigns
* payment processing through secure payment links
* rule-based compliance validation
* analytics dashboard metrics
* read-only client portal
* debtor payment page

Agents must follow the **implementation order defined in `plan.md`**.

---

# Forbidden Work

Agents must NOT implement any features that are listed as **out of scope** in `plan.md`.

Examples include but are not limited to:

* AI scoring or machine learning
* NLP analysis
* predictive contact optimization
* workflow builders
* voice/call center integrations
* skip tracing
* settlement negotiation
* dispute resolution
* installment payment plans
* bankruptcy monitoring
* credit bureau reporting
* document management systems
* advanced analytics
* white-label customization
* multi-language support
* full debtor self-service portals

If a task would introduce these capabilities, the agent must **stop and request clarification**.

---

# Architecture Rules

The system must follow the architecture implied by `plan.md`.

Primary surfaces:

1. Internal operations interface
2. Client portal
3. Debtor payment page

Agents must not introduce additional application surfaces.

---

# Data Model Rules

Agents must only implement the entities defined in `plan.md`.

Required entities:

* Client
* PortalUser
* Debtor
* Account
* Campaign
* Message
* Payment
* ComplianceRule
* ComplianceEvent

No additional entities should be introduced unless required to support these core objects.

---

# API Rules

API endpoints must align with `plan.md`.

Expected endpoint groups:

* `/auth`
* `/clients`
* `/debtors`
* `/accounts`
* `/campaigns`
* `/messages`
* `/payments`
* `/compliance`
* `/analytics`
* `/client-portal`

Agents must not create APIs outside these areas without approval.

---

# Implementation Order

Agents must follow the **build order defined in `plan.md`**:

1. Authentication and base application setup
2. Debtor, client, and account data model
3. Campaign management for email and SMS
4. Compliance validation
5. Debtor payment page and payment processor integration
6. Analytics summaries
7. Client portal

Agents must not skip steps or implement later features early.

---

# Code Discipline

Agents must:

* keep code modular
* follow the existing folder structure
* avoid large refactors
* implement minimal necessary logic

Agents must not:

* rewrite unrelated files
* introduce unnecessary dependencies
* change architecture defined in `plan.md`

---

# Security Requirements

Agents must ensure:

* clients only see their own portfolio data
* payment processing occurs server-side
* compliance decisions are logged
* account states remain consistent after payment attempts

---

# Compliance Logging

All compliance checks must produce a **ComplianceEvent**.

Agents must ensure:

* blocked sends are recorded
* allowed sends are recorded
* compliance decisions are auditable

---

# Final Rule

`plan.md` defines the product.

Agents must not:

* extend scope
* redesign the system
* introduce speculative features

If unsure, agents must ask for clarification instead of guessing.
