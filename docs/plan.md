# Zelus — Implementation Plan

> Lead Agent: Integrator
> Source of Truth: docs/PRD.md
> Date: 2025-02-10

---

## Current State

Foundation is built (~15%): React Router v7 SSR, Tailwind v4 theme (OKLCH), 13 shadcn/ui
components, brand assets, landing page, flat routes configured, Vitest, ESLint, Prettier, git
hooks.

**Everything below this line needs to be built.**

---

## Milestone Breakdown

### M1 — Scaffold + Tooling + Local DB + CI Scripts

**Goal:** Every developer can `docker compose up` + `bun run dev` and have a working local
environment with an empty database.

**Deliverables:**

1. `docker-compose.yml` — Postgres 16 with health check
2. `drizzle.config.ts` — Drizzle Kit configuration
3. `app/lib/db/index.ts` — DB client (node-postgres for local, `@neondatabase/serverless` for
   prod)
4. `app/lib/db/schema/` — All Drizzle table definitions (see DB Schema Contract below)
5. `app/lib/db/migrations/` — Initial migration
6. `scripts/seed.ts` — Create demo org + org_admin + demo fractions
7. Install missing deps: `drizzle-orm`, `drizzle-kit`, `postgres`, `@neondatabase/serverless`,
   `zod`, `dotenv`
8. Add scripts to `package.json`: `db:generate`, `db:migrate`, `db:seed`, `db:studio`
9. `.env.example` updated with `DATABASE_URL` example

**Acceptance Criteria:**

- `docker compose up -d` starts Postgres
- `bun run db:migrate` creates all tables
- `bun run db:seed` populates demo data
- `bun run typecheck` passes
- `bun run build` passes

---

### M2 — Auth + Org + RBAC Foundation

**Goal:** Users can sign up, log in, create an organization, and the system enforces RBAC on every
server-side access.

**Deliverables:**

1. `app/lib/auth/auth.ts` — Better Auth server config (email/password + Google + org plugin)
2. `app/lib/auth/auth.client.ts` — Better Auth client
3. `app/lib/auth/middleware.ts` — React Router middleware for session injection
4. `app/lib/auth/rbac.ts` — RBAC guard functions (`requireAuth`, `requireRole`,
   `requireOrgMember`, `requireOrgAdmin`)
5. Auth routes: `app/routes/_auth+/login.tsx`, `app/routes/_auth+/register.tsx`
6. Protected layout: `app/routes/_protected+/_layout.tsx` (auth guard, org check)
7. Org creation wizard: `app/routes/_protected+/onboarding+/` (3-step wizard per PRD 7A.3)
8. Dashboard stub: `app/routes/_protected+/dashboard.tsx`
9. App shell: `app/components/layout/sidebar.tsx`, `app/components/layout/header.tsx`,
   `app/components/layout/app-shell.tsx`
10. Better Auth tables in Drizzle schema (user, session, account, organization, member)

**Acceptance Criteria:**

- Email/password signup + login works
- Google OAuth works (with env vars configured)
- New user → prompted to create org → wizard completes → user is org_admin
- Unauthenticated access to protected routes → redirect to /login
- `requireRole('org_admin')` blocks fraction_member from admin actions
- All loaders/actions enforce org_id scoping

---

### M3 — Fractions + Association Approval + Invites + Audit Logs

**Goal:** Org Admin creates fractions, users request association, admin approves/rejects, fraction
owners can invite members. All critical actions are audit-logged.

**Deliverables:**

1. Service layer: `app/lib/services/fractions.ts`
   - `createFraction(orgId, data)`
   - `listFractions(orgId)`
   - `requestAssociation(orgId, userId, fractionId)`
   - `approveAssociation(orgId, associationId, adminUserId)`
   - `rejectAssociation(orgId, associationId, adminUserId)`
2. Service layer: `app/lib/services/invites.ts`
   - `createOrgInvite(orgId, email, adminUserId)`
   - `createFractionInvite(orgId, fractionId, email, inviterUserId)`
   - `acceptInvite(token)`
   - `validateInviteToken(token)`
3. Service layer: `app/lib/services/audit.ts`
   - `logAuditEvent(orgId, userId, action, entityType, entityId, metadata)`
4. Routes:
   - `app/routes/_protected+/fractions+/index.tsx` — List fractions
   - `app/routes/_protected+/fractions+/new.tsx` — Create fraction (admin only)
   - `app/routes/_protected+/fractions+/$id.tsx` — Fraction detail
   - `app/routes/_protected+/admin+/associations.tsx` — Pending associations (admin)
   - `app/routes/_protected+/admin+/invites.tsx` — Manage invites (admin)
5. Audit log table writes for: association changes, role changes

**Acceptance Criteria:**

- Org Admin creates fractions
- User requests fraction association → status = pending
- Admin approves → user gains access to fraction data
- Admin rejects → user does not gain access
- fraction_owner_admin can invite to their fraction
- fraction_member CANNOT invite
- Audit log records all association and role changes
- All data scoped by org_id — no cross-org leakage

---

### M4 — Tickets + Comments + Attachments + Suppliers + Maintenance

**Goal:** Full ticketing system with comments, file attachments, supplier directory, and maintenance
records.

**Deliverables:**

1. Service layer: `app/lib/services/tickets.ts`
   - `createTicket(orgId, userId, data)`
   - `listTickets(orgId, userId, role, filters)`
   - `getTicket(orgId, ticketId, userId, role)`
   - `updateTicketStatus(orgId, ticketId, newStatus, userId)`
   - `addComment(orgId, ticketId, userId, content, attachments)`
2. Service layer: `app/lib/services/suppliers.ts`
   - `createSupplier(orgId, data)`
   - `listSuppliers(orgId, filters)`
   - `getSupplier(orgId, supplierId)`
   - `updateSupplier(orgId, supplierId, data)`
3. Service layer: `app/lib/services/maintenance.ts`
   - `createRecord(orgId, data)`
   - `listRecords(orgId, filters)`
   - `getRecord(orgId, recordId)`
4. Storage: `app/lib/storage/blob.ts` — Vercel Blob upload/download
5. Routes:
   - `app/routes/_protected+/tickets+/index.tsx` — List tickets
   - `app/routes/_protected+/tickets+/new.tsx` — Create ticket
   - `app/routes/_protected+/tickets+/$id.tsx` — Ticket detail + comments
   - `app/routes/_protected+/suppliers+/index.tsx` — Supplier list
   - `app/routes/_protected+/suppliers+/new.tsx` — Add supplier (admin)
   - `app/routes/_protected+/suppliers+/$id.tsx` — Supplier detail
   - `app/routes/_protected+/maintenance+/index.tsx` — Maintenance list
   - `app/routes/_protected+/maintenance+/new.tsx` — Add record (admin)
   - `app/routes/_protected+/maintenance+/$id.tsx` — Record detail
6. Audit log for ticket status changes

**Acceptance Criteria:**

- Any authenticated user can create tickets in their org
- Only org_admin and fraction_owner_admin can change ticket status
- Comments are immutable (append-only)
- File attachments upload to Vercel Blob, metadata stored in DB
- Suppliers are org-scoped, admin-managed
- Maintenance records are admin-created, read-only for residents
- Ticket history is immutable
- All data scoped by org_id + appropriate role checks

---

### M5 — Search (FTS + Optional BM25) + "Pergunta Rápida" UI

**Goal:** Users can search across tickets, maintenance, suppliers, and FAQ using natural language
queries.

**Deliverables:**

1. `app/lib/search/provider.ts` — SearchProvider interface
2. `app/lib/search/fts.ts` — Postgres FTS implementation using `websearch_to_tsquery('portuguese')`
3. `app/lib/search/bm25.ts` — Optional BM25 behind feature flag (graceful fallback)
4. DB: `search_text` tsvector columns on tickets, maintenance_records, suppliers
5. Route: `app/routes/_protected+/search.tsx` — "Pergunta rápida" UI
6. Migration: add tsvector columns and GIN indexes

**Acceptance Criteria:**

- Portuguese-language queries return relevant results
- Results ranked by relevance (primary) + recency (secondary)
- All results scoped by org_id + user permissions
- BM25 feature flag defaults to off; FTS works if pg_textsearch is unavailable
- Search UI shows categorized results (tickets, suppliers, maintenance)

---

### M6 — Notifications + Email + Hardening + i18n

**Goal:** In-app and email notifications, internationalization, rate limiting, idempotency, and
production readiness.

**Deliverables:**

1. `app/lib/email/client.ts` — Resend client wrapper (console fallback for dev)
2. `app/lib/email/templates/` — Inline HTML string templates:
   - org-invite, fraction-invite, association-approved, association-rejected, ticket-update
3. Service: `app/lib/services/notifications.ts`
   - `createNotification(orgId, userId, type, data)`
   - `listNotifications(orgId, userId)`
   - `markAsRead(orgId, notificationId, userId)`
4. Route: `app/routes/_protected+/notifications.tsx`
5. Lingui setup: `@lingui/core`, `@lingui/react`, `@lingui/macro`
6. Locale files: pt-BR, en
7. Rate limiting on auth and invite flows
8. Idempotency keys for sensitive operations
9. README with setup and verification instructions

**Acceptance Criteria:**

- In-app notifications created on key actions
- Notification bell with unread count
- Email sent on invite, association approval/rejection, ticket status change
- Dev mode: emails logged to console if RESEND_API_KEY missing
- All user-facing strings wrapped in Lingui macros
- Language switcher works (pt-BR / en)
- Rate limiting blocks brute-force on login/invite
- Critical actions are idempotent

---

## DB Schema Contract

All agents MUST use these exact table/column names. This is the canonical schema.

```typescript
// app/lib/db/schema/organizations.ts
export const organizations = pgTable('organizations', {
  id: text('id').primaryKey(), // Better Auth generates these
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  city: text('city'),
  totalFractions: integer('total_fractions'),
  notes: text('notes'),
  language: text('language').notNull().default('pt-PT'),
  timezone: text('timezone').notNull().default('Europe/Lisbon'),
  logo: text('logo'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
})

// app/lib/db/schema/fractions.ts
export const fractions = pgTable('fractions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orgId: text('org_id')
    .notNull()
    .references(() => organizations.id),
  label: text('label').notNull(), // e.g. "T3 – 2º Esq."
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
})

// app/lib/db/schema/user-fractions.ts
export const userFractions = pgTable('user_fractions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orgId: text('org_id')
    .notNull()
    .references(() => organizations.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  fractionId: text('fraction_id')
    .notNull()
    .references(() => fractions.id),
  role: text('role', { enum: ['fraction_owner_admin', 'fraction_member'] }).notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] })
    .notNull()
    .default('pending'),
  invitedBy: text('invited_by').references(() => users.id),
  approvedBy: text('approved_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
})

// app/lib/db/schema/tickets.ts
export const tickets = pgTable('tickets', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orgId: text('org_id')
    .notNull()
    .references(() => organizations.id),
  fractionId: text('fraction_id').references(() => fractions.id),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status', { enum: ['open', 'in_progress', 'resolved', 'closed'] })
    .notNull()
    .default('open'),
  searchText: text('search_text'), // tsvector populated via trigger or app code
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
})

// app/lib/db/schema/ticket-comments.ts
export const ticketComments = pgTable('ticket_comments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orgId: text('org_id')
    .notNull()
    .references(() => organizations.id),
  ticketId: text('ticket_id')
    .notNull()
    .references(() => tickets.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  // No updatedAt — comments are immutable
})

// app/lib/db/schema/ticket-attachments.ts
export const ticketAttachments = pgTable('ticket_attachments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orgId: text('org_id')
    .notNull()
    .references(() => organizations.id),
  ticketId: text('ticket_id').references(() => tickets.id),
  commentId: text('comment_id').references(() => ticketComments.id),
  uploadedBy: text('uploaded_by')
    .notNull()
    .references(() => users.id),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// app/lib/db/schema/suppliers.ts
export const suppliers = pgTable('suppliers', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orgId: text('org_id')
    .notNull()
    .references(() => organizations.id),
  name: text('name').notNull(),
  category: text('category').notNull(),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  address: text('address'),
  notes: text('notes'),
  searchText: text('search_text'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
})

// app/lib/db/schema/maintenance-records.ts
export const maintenanceRecords = pgTable('maintenance_records', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orgId: text('org_id')
    .notNull()
    .references(() => organizations.id),
  supplierId: text('supplier_id').references(() => suppliers.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  performedAt: timestamp('performed_at').notNull(),
  cost: numeric('cost', { precision: 10, scale: 2 }),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  searchText: text('search_text'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
})

// app/lib/db/schema/notifications.ts
export const notifications = pgTable('notifications', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orgId: text('org_id')
    .notNull()
    .references(() => organizations.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  type: text('type').notNull(), // e.g. 'ticket_update', 'association_approved'
  title: text('title').notNull(),
  message: text('message').notNull(),
  metadata: jsonb('metadata'), // { ticketId, fractionId, etc. }
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// app/lib/db/schema/audit-logs.ts
export const auditLogs = pgTable('audit_logs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orgId: text('org_id')
    .notNull()
    .references(() => organizations.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  action: text('action').notNull(), // e.g. 'association.approved', 'ticket.status_changed'
  entityType: text('entity_type').notNull(), // e.g. 'user_fraction', 'ticket'
  entityId: text('entity_id').notNull(),
  metadata: jsonb('metadata'), // old/new values
  createdAt: timestamp('created_at').notNull().defaultNow(),
  // No updatedAt — audit logs are immutable
})

// app/lib/db/schema/invites.ts
export const invites = pgTable('invites', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orgId: text('org_id')
    .notNull()
    .references(() => organizations.id),
  email: text('email').notNull(),
  type: text('type', { enum: ['org', 'fraction'] }).notNull(),
  fractionId: text('fraction_id').references(() => fractions.id),
  role: text('role', { enum: ['org_admin', 'fraction_owner_admin', 'fraction_member'] }).notNull(),
  token: text('token').notNull().unique(),
  invitedBy: text('invited_by')
    .notNull()
    .references(() => users.id),
  status: text('status', { enum: ['pending', 'accepted', 'expired'] })
    .notNull()
    .default('pending'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
```

**Notes on Better Auth tables:** Better Auth with the org plugin creates its own `user`,
`session`, `account`, `organization`, and `member` tables. We use Better Auth's `organization`
table AS our `organizations` table (extending it with custom fields). The `users` reference in our
schema points to Better Auth's `user` table.

**Indexes (DB Agent must create):**

- `fractions(org_id)`
- `user_fractions(org_id, user_id)`
- `user_fractions(org_id, fraction_id)`
- `user_fractions(org_id, status)` — for pending association queries
- `tickets(org_id, status)`
- `tickets(org_id, fraction_id)`
- `ticket_comments(ticket_id)`
- `suppliers(org_id)`
- `maintenance_records(org_id)`
- `notifications(org_id, user_id, read_at)` — for unread count
- `audit_logs(org_id, entity_type, entity_id)`
- `invites(token)` — unique
- `invites(org_id, status)`
- GIN indexes on tsvector columns (M5)

---

## Service Layer Interface Contract

All service functions receive `orgId` + user context. They NEVER trust the client.

```typescript
// Shared context type passed to all service functions
type ServiceContext = {
  orgId: string
  userId: string
  userRole: 'org_admin' | 'fraction_owner_admin' | 'fraction_member'
}
```

### RBAC Guards (used in loaders/actions before calling services)

```typescript
// app/lib/auth/rbac.ts

// Throws redirect to /login if not authenticated
export async function requireAuth(request: Request): Promise<{
  user: User
  session: Session
}>

// Throws 403 if user is not a member of the org
export async function requireOrgMember(request: Request): Promise<{
  user: User
  session: Session
  org: Organization
  role: UserRole
}>

// Throws 403 if user is not org_admin
export async function requireOrgAdmin(request: Request): Promise<{
  user: User
  session: Session
  org: Organization
}>

// Throws 403 if user doesn't have one of the allowed roles
export async function requireRole(
  request: Request,
  roles: UserRole[],
): Promise<{
  user: User
  session: Session
  org: Organization
  role: UserRole
}>
```

### Usage Pattern in Route Modules

```typescript
// Example: app/routes/_protected+/fractions+/new.tsx
import { requireOrgAdmin } from '~/lib/auth/rbac'
import { createFraction } from '~/lib/services/fractions'

export async function loader({ request }: Route.LoaderArgs) {
  await requireOrgAdmin(request)
  return {}
}

export async function action({ request }: Route.ActionArgs) {
  const { user, org } = await requireOrgAdmin(request)
  const formData = await request.formData()
  // validate with Zod...
  const fraction = await createFraction(org.id, { label, description })
  return redirect(`/fractions/${fraction.id}`)
}
```

---

## Auth Middleware Pattern

```typescript
// app/lib/auth/middleware.ts
// React Router v7 middleware that injects session into context
// Available in loaders/actions via args.context.session

import { auth } from '~/lib/auth/auth'

export const authMiddleware: MiddlewareFn = async ({ request, context }, next) => {
  const session = await auth.api.getSession({ headers: request.headers })
  context.session = session
  return next()
}
```

---

## Decisions Log

File: `docs/DECISIONS.md` — will be maintained by Lead as questions arise.

Initial decisions:

1. **Better Auth org table = our organizations table.** We extend Better Auth's organization table
   with custom fields (city, totalFractions, notes, language, timezone) rather than creating a
   separate table. This avoids dual-write issues.

2. **User roles.** Better Auth org plugin has a `role` field on the `member` table. We use this
   for `org_admin`. Fraction-level roles (`fraction_owner_admin`, `fraction_member`) live in the
   `user_fractions` table. The RBAC guard functions resolve the effective role by checking both.

3. **IDs are text (UUIDs).** Better Auth uses text IDs. All our tables follow the same pattern for
   consistency.

4. **No separate API layer.** All data access through React Router loaders/actions per PRD §11.

5. **Search text columns.** We store denormalized `search_text` as a `tsvector` column updated via
   application code (not triggers) for portability to Neon.

---

## Agent Task Assignments

### Phase 1: M1 (Scaffold + DB)

| Agent    | Task                                                         | Dependencies  |
| -------- | ------------------------------------------------------------ | ------------- |
| DB Agent | docker-compose.yml, Drizzle config, schema, migrations, seed | None          |
| Lead     | Install deps, package.json scripts, verify                   | DB Agent done |

### Phase 2: M2 (Auth + Org + RBAC)

| Agent          | Task                                                 | Dependencies         |
| -------------- | ---------------------------------------------------- | -------------------- |
| Auth Agent     | Better Auth setup, middleware, RBAC guards           | M1 complete          |
| Route/UI Agent | Auth routes, protected layout, app shell, org wizard | Auth Agent contracts |
| Lead           | Integration test, verify auth flow end-to-end        | Both done            |

### Phase 3: M3 (Fractions + Invites + Audit)

| Agent               | Task                                                      | Dependencies       |
| ------------------- | --------------------------------------------------------- | ------------------ |
| Model/Service Agent | Fraction services, invite services, audit logging         | M2 complete        |
| Route/UI Agent      | Fraction routes, admin association UI, invite UI          | Service interfaces |
| Email Agent         | Invite email templates                                    | M2 complete        |
| Lead                | Verify association flow, audit logs, no cross-org leakage | All done           |

### Phase 4: M4 (Tickets + Suppliers + Maintenance)

| Agent               | Task                                       | Dependencies       |
| ------------------- | ------------------------------------------ | ------------------ |
| Model/Service Agent | Ticket, supplier, maintenance services     | M3 complete        |
| Route/UI Agent      | All CRUD routes and UI                     | Service interfaces |
| Storage Agent       | Vercel Blob integration for attachments    | M2 complete        |
| Lead                | Verify RBAC on all routes, attachment flow | All done           |

### Phase 5: M5 (Search)

| Agent          | Task                                              | Dependencies              |
| -------------- | ------------------------------------------------- | ------------------------- |
| Search Agent   | FTS implementation, tsvector migration, BM25 flag | M4 complete               |
| Route/UI Agent | "Pergunta rápida" search UI                       | Search provider interface |
| Lead           | Verify search scoping + relevance                 | All done                  |

### Phase 6: M6 (Notifications + Email + i18n + Hardening)

| Agent               | Task                                                        | Dependencies       |
| ------------------- | ----------------------------------------------------------- | ------------------ |
| Email Agent         | Resend client, all email templates                          | M4 complete        |
| Model/Service Agent | Notification service                                        | M4 complete        |
| Route/UI Agent      | Notifications page, notification bell                       | Service interfaces |
| Lead + QA           | i18n setup, rate limiting, idempotency, smoke tests, README | All done           |

---

## Verification Commands (per milestone)

```bash
# M1
docker compose up -d
bun run db:migrate
bun run db:seed
bun run typecheck
bun run build

# M2
bun run dev
# Manual: signup → login → create org → verify redirect
bun run typecheck && bun run build

# M3
# Manual: create fraction → request association → approve → verify access
# Manual: verify audit log entries in DB
bun run typecheck && bun run build

# M4
# Manual: create ticket → add comment → attach file → change status
# Manual: create supplier → create maintenance record
bun run typecheck && bun run build

# M5
# Manual: search for ticket by description → verify results
# Manual: verify non-org results are excluded
bun run typecheck && bun run build

# M6
bun run test
bun run typecheck && bun run build
# Manual: verify emails (console logs in dev)
# Manual: verify notifications appear
# Manual: switch language → verify translation
```

---

## Next Step

**Begin M1.** DB Agent starts immediately with docker-compose + Drizzle schema + migrations + seed.
