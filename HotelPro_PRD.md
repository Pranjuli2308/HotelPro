# HotelPro — Product Requirements Document (PRD)

**Version:** 1.0 — Draft for stakeholder review  
**Prepared on:** 11 October 2026  
**Product category:** Web-based hotel operations and reservation management  
**Primary technology stack:** MongoDB, Express.js, React, Node.js (MERN)  
**Audience:** Project owner, developers, QA, UI/UX, and project evaluators

> **Naming note:** The source brief uses both “HotelPro” and “Roomly.” This PRD standardizes the product name as **HotelPro**. Replace it globally if Roomly is the approved final name.

---

## 1. Executive Summary

HotelPro is a responsive hotel management web application that centralizes guest reservations, room inventory, payments, front-desk workflows, housekeeping, staff operations, and administrative reporting. Guests can discover rooms, check availability, reserve a stay, manage bookings, and receive confirmations. Authorized hotel staff can manage check-in/check-out and room status, while administrators oversee users, properties, staff, bookings, payments, and audit activity.

The first release should deliver a dependable end-to-end booking lifecycle with secure authentication, role-based permissions, accurate availability, and payment-provider integration in test mode. Advanced analytics, multi-property enterprise controls, caching, and extensive automation can follow after the core workflows are stable.

## 2. Product Vision and Objectives

**Vision:** Provide hotels with one secure, easy-to-use platform that reduces manual coordination and improves the guest journey from room discovery through checkout.

Objectives:

- Reduce double bookings through server-side availability validation and reservation-safe inventory updates.
- Make guest, reservation, room, and payment information accessible to the correct users at the right time.
- Standardize front-desk workflows for check-in, checkout, room readiness, and service requests.
- Give administrators operational visibility through searchable records, reports, and audit logs.
- Build a maintainable MERN architecture that can scale to more rooms, users, and properties.

### 2.1 Success Metrics

| Metric | Initial target / definition | Measurement |
|---|---|---|
| Booking completion | At least 95% of valid test bookings complete without application error | Automated end-to-end tests |
| Double-booking prevention | Zero overlapping confirmed bookings for the same room | Concurrency and integration tests |
| API reliability | At least 99.5% successful responses for healthy, valid requests in test runs | API test results / monitoring |
| Core API latency | p95 under 500 ms for common read endpoints under agreed test load | Load test; exclude external payment/email latency |
| Security | All protected endpoints enforce authentication and role permissions | Authorization test matrix |
| Operational adoption | Staff can complete check-in/out and room-status tasks without developer assistance | Usability test with representative users |

## 3. Scope

### 3.1 In Scope — MVP

- Guest registration, login, logout, profile management, and password hashing.
- Role-based access for Guest, Staff, and Admin; hotel/manager permissions can be refined as needed.
- Hotel and room catalogue with room types, photos, amenities, pricing, and availability search.
- Booking creation, confirmation, booking history, modification/cancellation rules, and status tracking.
- Payment initiation and provider-side verification using a sandbox/test environment; payment records and invoices.
- Staff workflows for reservation lookup, check-in, checkout, room status, and basic housekeeping tasks.
- Admin management of hotels, rooms, users, staff, reservations, payment records, and basic reports.
- Email confirmation/notification integration, input validation, API error handling, and audit logging for sensitive actions.
- Responsive React interface, pagination, filtering, and clear success/error notifications.

### 3.2 Later / Optional

- Multi-property organization hierarchy, advanced chain-wide reporting, and granular custom permission policies.
- Dynamic seasonal pricing rules, promotions, loyalty points, and channel-manager integrations.
- Redis caching, background job queues, real-time push updates, and microservice separation.
- Advanced revenue management, forecasting, housekeeping optimization, and configurable report builder.
- Dark/light theme and native mobile applications.

### 3.3 Out of Scope for MVP

- Building a payment processor or storing raw card numbers/CVV.
- Guaranteed compliance certification or legal conclusions without a formal review.
- Integration with every third-party hotel, accounting, tax, or booking-channel system.
- Automated identity-document verification unless separately approved and specified.

## 4. Users, Roles, and Permissions

| Role | Primary goals | Core permissions |
|---|---|---|
| Guest | Find a suitable room and manage a stay | Manage own profile/bookings; pay for own reservations; submit reviews for eligible stays |
| Staff | Run daily front-desk and room operations | View operational reservations; check guests in/out; update room status; manage assigned service/housekeeping tasks |
| Admin | Configure and monitor the platform/property | Manage users, hotels, rooms, staff, pricing, bookings, payment records, reports, configuration, and audit logs |

Authorization must be enforced on the server for every protected operation. Hiding a button in the UI is not an access-control mechanism. Staff access should be scoped to the hotel(s) to which the staff member is assigned.

## 5. Key User Journeys

### 5.1 Guest Booking

1. Guest enters destination/property, check-in and check-out dates, and guest count.
2. System validates dates and returns rooms that can accommodate the requested stay, with total price and key amenities.
3. Guest opens room details, selects a room/rate, signs in or registers, and confirms guest details.
4. Server rechecks availability and calculates the authoritative price before creating a pending reservation.
5. Guest completes payment through the payment provider; server verifies the provider result/webhook.
6. Booking becomes confirmed only when the configured payment/booking policy is satisfied. Guest receives a confirmation and invoice/receipt.
7. Guest can view booking status and request eligible modifications or cancellation.

### 5.2 Staff Check-In and Checkout

1. Staff searches by booking reference, guest name, or date and verifies the reservation is eligible for arrival.
2. Staff records check-in and assigns/validates a ready room; the system logs the staff member and timestamp.
3. At departure, staff reviews outstanding charges/services and records checkout.
4. Room status changes to Cleaning/Dirty and a housekeeping task is created or updated.

### 5.3 Admin Operations

1. Admin creates or updates a property, room types, rooms, amenities, rates, and operational status.
2. Admin manages staff accounts and hotel assignments.
3. Admin reviews booking, payment, occupancy, and revenue summaries over a selected date range.
4. Sensitive actions are recorded in an audit log with actor, action, target, timestamp, and outcome.

## 6. Functional Requirements

Priority key: **P0** = required for a usable MVP; **P1** = important follow-on capability; **P2** = enhancement after core workflows.

| ID | Area | Requirement | Priority |
|---|---|---|---|
| FR-001 | Authentication | Users can register and log in with validated credentials; passwords are stored as secure hashes, never plaintext. | P0 |
| FR-002 | Authorization | API endpoints enforce Guest, Staff, and Admin permissions and hotel-level scope where applicable. | P0 |
| FR-003 | Session lifecycle | Users can log out; access tokens expire; refresh/session strategy and revocation behavior are documented. | P0 |
| FR-004 | Profile | Guests can view/update permitted profile fields; users cannot edit another user's profile. | P1 |
| FR-005 | Property catalogue | Guests can browse active hotels, room types, amenities, photos, and published rates. | P0 |
| FR-006 | Search & availability | Search accepts valid dates, occupancy, and optional filters; results exclude unavailable/maintenance rooms. | P0 |
| FR-007 | Price calculation | Server calculates nightly rates, taxes/fees where configured, discounts if enabled, and total amount. | P0 |
| FR-008 | Booking creation | A booking has a unique reference, guest, property/room or room type, dates, price snapshot, and status. | P0 |
| FR-009 | Inventory integrity | Server revalidates availability atomically enough to prevent overlapping confirmed reservations. | P0 |
| FR-010 | Booking management | Guests can view their own booking history and request permitted modifications/cancellations. | P0 |
| FR-011 | Payment | System creates provider payment sessions/orders and verifies completion server-side; client-only success is never trusted. | P0 |
| FR-012 | Refund tracking | Authorized staff/admin can record or initiate eligible refunds; status and provider reference are retained. | P1 |
| FR-013 | Invoice/receipt | System generates a booking-linked invoice/receipt with itemized totals and payment status. | P1 |
| FR-014 | Notifications | System sends booking lifecycle emails and records notification outcome where practical. | P1 |
| FR-015 | Check-in | Authorized staff can check in an eligible confirmed booking and record time, actor, and assigned room. | P0 |
| FR-016 | Checkout | Authorized staff can check out an in-house booking and transition room status to Cleaning/Dirty. | P0 |
| FR-017 | Room status | Staff can update room state using allowed transitions; rooms under maintenance cannot be sold. | P0 |
| FR-018 | Housekeeping/services | Staff can create, assign, update, and close housekeeping or guest-service tasks. | P1 |
| FR-019 | Reviews | Eligible guests can submit a rating/comment once per completed stay; moderation is available to admins. | P2 |
| FR-020 | Administration | Admins can manage users, hotels, room inventory, staff assignments, reservations, and platform settings. | P0 |
| FR-021 | Reports | Authorized users can view date-filtered booking counts, occupancy, and payment/revenue summaries. | P1 |
| FR-022 | Audit log | System records security-sensitive and operationally significant actions without logging secrets or payment-card data. | P1 |
| FR-023 | Search usability | Lists support pagination, sorting, and validated filters; empty and error states are understandable. | P1 |
| FR-024 | Error handling | API returns consistent error shapes and appropriate HTTP status codes; UI shows actionable messages. | P0 |

## 7. Business Rules

- Check-out date must be later than check-in date; dates are interpreted in the property's local timezone.
- A room cannot have overlapping active reservations for the same stay dates. The final check occurs on the server at booking/confirmation time.
- Availability search is advisory; booking creation must perform a fresh availability and price validation.
- Booking statuses: `PendingPayment`, `Confirmed`, `CheckedIn`, `CheckedOut`, `CancellationRequested`, `Cancelled`, `PaymentFailed`, and `NoShow`. The team may simplify this list if workflow scope requires it.
- Payment statuses: `Initiated`, `Pending`, `Succeeded`, `Failed`, `RefundPending`, `PartiallyRefunded`, and `Refunded`.
- Room statuses: `Available`, `Reserved`, `Occupied`, `Cleaning`, `Maintenance`, and `OutOfService`. Room condition and reservation status should not be represented as the same field.
- Cancellation eligibility, fees, and refund amounts follow the rate/policy snapshot stored with the booking, not a subsequently edited policy.
- Store a price breakdown snapshot on each booking so historical invoices remain stable after rate changes.
- Use idempotency controls for payment webhooks and booking/payment creation to avoid duplicate records.
- Never store raw card data or CVV. Use the payment provider's hosted checkout/tokenized flow and follow provider guidance.

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | Use HTTPS in deployed environments, bcrypt-compatible password hashing, short-lived access tokens, secure secret management, input validation, rate limiting on sensitive endpoints, and least-privilege database credentials. |
| Privacy | Collect only necessary guest data; restrict access by role/property; define retention and deletion policies; avoid sensitive data in logs. |
| Performance | Target p95 under 500 ms for common API reads under an agreed baseline load, excluding third-party services; paginate all potentially large lists. |
| Availability | Design for graceful failure of email/payment providers and clear recovery paths; define deployment uptime target before production. |
| Scalability | Stateless API instances where practical, indexed MongoDB queries, externalized media storage, and background processing for non-blocking work. |
| Usability | Responsive layouts for desktop, tablet, and mobile; accessible labels, keyboard navigation, readable validation, and consistent loading/empty/error states. |
| Maintainability | Modular backend routes/controllers/services, schema validation, environment-based configuration, linting, documented API contracts, and automated tests. |
| Observability | Structured application logs, health endpoint, error monitoring, audit events, and basic booking/payment operational metrics. |
| Compatibility | Support current stable Chrome and Firefox; test common responsive viewport sizes. |
| Recovery | Document MongoDB backup/restore and deployment rollback procedures before production use. |

## 9. Proposed Technical Architecture

Architecture: **React single-page application → Express REST API on Node.js → MongoDB.** External services provide email delivery, room-image storage, and payment processing.

| Layer | Proposed responsibilities | Implementation notes |
|---|---|---|
| Frontend | Guest booking UI, guest dashboard, staff operations screens, admin dashboard | React, React Router, Axios, Bootstrap; optional Redux Toolkit where shared state warrants it; toast notifications |
| API | Authentication, validation, authorization, booking logic, payments, reports | Express routers/controllers/services; centralized error middleware; versioned `/api/v1` routes |
| Data | Users, hotels, rooms, bookings, payments, tasks, reviews, logs | Mongoose schemas, indexes, references, schema validation; transactions where supported/configured |
| Security | Identity, access control, secrets, audit | JWT access tokens; secure refresh strategy if implemented; bcrypt; rate limiting; Helmet; CORS allowlist |
| Integrations | Payment, email, media storage | Provider sandbox for development; verify payment webhooks; keep credentials in environment variables |
| Quality | Automated checks and API validation | Jest/Vitest or equivalent, Supertest, Postman collections, end-to-end browser tests |

### 9.1 Environment Configuration

Required configuration keys should be documented in `.env.example`, but real secrets must never be committed. Suggested keys:

`PORT`, `NODE_ENV`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (if used), `CLIENT_URL`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `PAYMENT_PROVIDER_KEY`, `PAYMENT_WEBHOOK_SECRET`, and media-storage credentials.

### 9.2 Suggested Repository Layout

```text
hotelpro/
  client/   # React app: pages, components, features, services, routes
  server/   # config, models, routes, controllers, services, middleware, utils
  docs/     # API contract, data dictionary, test plan
  .env.example
  README.md
```

## 10. Data Model — Initial Proposal

| Collection | Key fields / relationships | Notes |
|---|---|---|
| Users | `_id, name, email, passwordHash, role, status, emailVerifiedAt, createdAt` | Unique normalized email; avoid storing plaintext secrets. |
| Hotels | `_id, name, address, timezone, contact, policies, status` | Admin-managed property record. |
| RoomTypes | `_id, hotelId, name, capacity, amenities, baseRate, images` | Hotel-scoped room category and public description. |
| Rooms | `_id, hotelId, roomTypeId, roomNumber, floor, operationalStatus` | Unique roomNumber per hotel; operational state separate from booking state. |
| Bookings | `_id, bookingRef, guestId, hotelId, roomTypeId/roomId, checkIn, checkOut, guests, priceSnapshot, status, cancellationPolicySnapshot` | Indexes for guest history, property/date search, bookingRef; enforce overlap protection in service logic. |
| Payments | `_id, bookingId, provider, providerReference, amount, currency, status, idempotencyKey, timestamps` | Never store raw card details; webhook events must be idempotent. |
| ServiceTasks | `_id, hotelId, roomId, bookingId, type, assignedTo, status, priority, timestamps` | Housekeeping and guest requests. |
| Reviews | `_id, bookingId, guestId, hotelId, rating, comment, moderationStatus` | Unique review per eligible completed booking. |
| Notifications | `_id, userId, channel, template, status, relatedEntity, sentAt` | Do not persist unnecessary sensitive content. |
| AuditLogs | `_id, actorId, hotelId, action, targetType, targetId, outcome, timestamp, metadata` | Redact credentials, tokens, and payment secrets. |

**Implementation note:** The brief lists Guests and Staff separately from Users. Prefer one Users collection with role and profile fields unless a demonstrated need requires separate collections; this reduces duplicate identity records. A separate Guest profile can reference Users if guest-specific fields grow.

## 11. API Requirements — Proposed REST Contract

| Method & endpoint | Purpose | Access |
|---|---|---|
| `POST /api/v1/auth/register` | Create guest account | Public |
| `POST /api/v1/auth/login` | Authenticate user | Public; rate limited |
| `POST /api/v1/auth/logout` | End current session/refresh token | Authenticated |
| `GET /api/v1/hotels` | List/search active properties | Public |
| `GET /api/v1/hotels/:hotelId/rooms` | Browse room types/rooms and availability | Public |
| `GET /api/v1/rooms/:roomId` | Room detail | Public |
| `POST /api/v1/bookings` | Create pending reservation after availability recheck | Guest |
| `GET /api/v1/bookings/me` | List current guest bookings | Guest |
| `GET /api/v1/bookings/:bookingId` | View booking if owner or authorized staff/admin | Scoped |
| `PATCH /api/v1/bookings/:bookingId` | Modify permitted booking fields | Owner or authorized staff/admin |
| `POST /api/v1/bookings/:bookingId/cancel` | Request/carry out cancellation per policy | Owner or authorized staff/admin |
| `POST /api/v1/payments/checkout-session` | Create provider checkout/order | Booking owner |
| `POST /api/v1/payments/webhook` | Verify provider event and update payment/booking | Provider signature verification |
| `POST /api/v1/operations/check-in` | Check in eligible booking | Staff/Admin |
| `POST /api/v1/operations/check-out` | Check out in-house booking | Staff/Admin |
| `PATCH /api/v1/rooms/:roomId/status` | Update room operational status | Staff/Admin, property-scoped |
| `GET /api/v1/admin/reports/occupancy` | Occupancy report by date range | Admin |
| `GET /api/v1/admin/reports/revenue` | Payment/revenue report by date range | Admin |

All endpoints should use consistent JSON responses, validation, pagination, request IDs, and safe error messages. The API contract should be finalized before frontend integration.

## 12. UI / UX Requirements

| Screen | Required elements |
|---|---|
| Home / Search | Property or destination search, dates, guest count, popular room/property content, clear search action. |
| Room Results | Date summary, price, capacity, amenities, image, filters, sort, pagination, unavailable/empty states. |
| Room Details | Gallery, amenities, occupancy, cancellation terms, nightly rate and total breakdown, booking CTA. |
| Booking / Payment | Guest details, stay dates, price breakdown, policy acknowledgement, secure provider checkout handoff. |
| Guest Dashboard | Upcoming/past bookings, booking status, invoice/receipt, cancellation/modification actions where allowed. |
| Staff Dashboard | Arrivals/departures, reservation search, check-in/out actions, room status, housekeeping queue. |
| Admin Dashboard | Summary metrics, user/hotel/room/staff management, booking/payment lists, reports, audit log. |
| Notifications | In-app status messages and email delivery status where available; avoid exposing private data in previews. |

Design principles: consistent navigation by role, mobile-first responsive layouts, accessible form labels, visible loading states, confirmation for destructive actions, and concise validation messages.

## 13. Security, Privacy, and Compliance

- Hash passwords using bcrypt or an equivalent maintained password-hashing algorithm with an appropriate work factor.
- Validate and normalize all input on the server; use Mongoose schema validation and explicit allowlists for updates.
- Apply role and property-level authorization to every sensitive operation; test for insecure direct object references.
- Use secure token handling. If refresh tokens are used, store them in secure, HttpOnly, SameSite cookies and define rotation/revocation; avoid browser localStorage for long-lived secrets.
- Configure CORS to trusted client origins, use security headers, rate-limit login and recovery routes, and protect against brute force.
- Verify payment webhooks cryptographically and process each event idempotently; do not rely on client redirect parameters.
- Keep API keys and credentials outside source control; rotate secrets and restrict production access.
- Log administrative and payment state changes, but redact passwords, tokens, card data, and unnecessary personal information.
- Use HTTPS in production, encrypted managed storage/backups where available, and documented retention/deletion policies.
- Conduct dependency scanning, authorization testing, and a pre-release security review. Applicable privacy/payment obligations require confirmation for the actual operating regions and provider choices.

## 14. Testing and Acceptance Criteria

| Test area | Acceptance criteria |
|---|---|
| Authentication | Valid users can register/login/logout; invalid credentials fail safely; protected endpoints reject missing/expired tokens; role violations return 403 or equivalent. |
| Availability | Search validates dates and occupancy; rooms marked maintenance/out-of-service are excluded; overlapping active reservations cannot both be confirmed, including concurrent requests. |
| Booking | Valid booking creates a unique reference and price snapshot; guest can only access their own booking; failed payment does not incorrectly mark booking paid/confirmed. |
| Payment | Provider webhook signature is checked; duplicate webhook delivery does not duplicate payment or booking state changes; refund status is traceable. |
| Operations | Only authorized staff can check in eligible bookings; checkout updates booking and room state; all transitions are audited. |
| Administration | Admin-only screens and endpoints are protected; staff are scoped to assigned properties; report totals match source records for the selected period. |
| UI | Core journeys work on desktop and mobile; forms show field-level errors; loading, empty, success, and failure states are present. |
| Reliability | API errors use consistent response shapes; email/payment-provider outages do not corrupt booking/payment records. |
| Quality gate | Automated unit/integration tests pass; critical user journeys pass end-to-end tests; no known critical/high severity security issue remains open. |

## 15. Delivery Plan and Priorities

| Phase | Deliverables | Exit criteria |
|---|---|---|
| 0 — Foundation | Repository, environment setup, linting, API conventions, MongoDB connection, CI basics | App starts locally from README; health endpoint and environment validation work. |
| 1 — Identity & catalogue | Auth, roles, hotel/room CRUD, room listing/details | Role tests pass; admins can publish room inventory. |
| 2 — Booking core | Availability search, pricing snapshot, booking creation/history/cancellation rules | Double-booking tests pass; guest journey works without live payment. |
| 3 — Payments & messaging | Sandbox checkout, verified webhook, invoices, email confirmation | Payment lifecycle and duplicate webhook tests pass. |
| 4 — Staff operations | Check-in/out, room status, housekeeping tasks | Staff workflows and property scoping pass acceptance tests. |
| 5 — Admin & reports | User/staff management, payment tracking, occupancy/revenue reports, audit logs | Report totals reconcile with test data; sensitive actions audited. |
| 6 — Hardening & release | Responsive polish, performance checks, security review, backup/restore and deployment docs | Critical acceptance suite passes; release checklist approved. |

## 16. Risks, Dependencies, and Mitigations

| Risk / dependency | Impact | Mitigation |
|---|---|---|
| Double booking under concurrent requests | High — customer and revenue impact | Recheck inventory server-side, use transaction/locking strategy appropriate to deployment, and test concurrency. |
| Payment provider/webhook complexity | High — incorrect payment state | Choose one provider early; use sandbox, signature verification, idempotency, reconciliation, and retry-safe handlers. |
| Unclear single vs multi-property scope | Medium/High — schema and permissions rework | MVP supports property-scoped records; confirm whether one organization can own multiple hotels. |
| Room vs room-type booking model unresolved | High — availability design changes | Decide whether a guest reserves a specific room or room type; document allocation policy before implementation. |
| Privacy/legal obligations vary by region | High — compliance exposure | Confirm operating markets, retention rules, tax/invoice requirements, and provider obligations with qualified stakeholders. |
| Email/media provider availability | Medium — delayed confirmations or broken imagery | Queue/retry delivery, track failures, and keep core booking records independent of delivery success. |
| Overly broad MVP | High — schedule slippage | Deliver P0 flows first; move advanced forecasting, microservices, and extensive integrations to later scope. |

## 17. Assumptions and Open Questions

| Question | Working assumption / decision needed |
|---|---|
| Final product name? | Use HotelPro in this PRD; source brief also says Roomly. Confirm one name. |
| Single hotel or multi-property platform? | Design data with hotelId/property scope; MVP may operate one property while retaining extensibility. |
| Book a specific room or room category? | Unresolved. Recommendation: guest books a room type; staff/system assigns a specific room before check-in, unless the business requires exact-room selection. |
| Payment provider? | Stripe or Razorpay are candidates from the brief. Select based on target market, currency, and business account eligibility. |
| Taxes, fees, and currency? | Configure by property and currency; do not hard-code a jurisdiction or tax rate. |
| Cancellation policy? | Admin-configurable policy stored as a booking snapshot; define deadline, fees, and refund calculation. |
| Email/SMS provider? | Email is in MVP; SMS/WhatsApp can be later scope. |
| Deployment target? | To be selected. Keep app configurable for cloud deployment and document secrets, backups, monitoring, and rollback. |
| Identity verification and sensitive guest data? | Collect only required data; any document capture or verification needs separate approval and security/privacy review. |
| Mentor / product owner? | No mentor is assigned in the supplied brief; designate a decision-maker for scope and acceptance sign-off. |

## 18. Definition of Done

- Feature behavior and acceptance criteria are documented and reviewed.
- Server-side validation and authorization are implemented and tested.
- Unit/integration tests cover success, failure, and permission boundaries.
- UI handles loading, empty, validation, and error states responsively.
- API documentation and environment setup instructions are updated.
- No secrets or sensitive personal/payment data are committed or exposed in logs.
- Relevant audit events, metrics, and failure handling are in place.
- Code review is complete and the feature is deployed to a test environment for acceptance.

## Appendix A — Glossary

| Term | Meaning |
|---|---|
| Availability | Whether inventory can be reserved for the full requested date range. |
| Booking / reservation | A record of a guest's intended or confirmed stay. |
| Room type | A category of rooms with shared attributes, capacity, and pricing. |
| Room status | Operational condition of a physical room, such as Available, Cleaning, or Maintenance. |
| Payment webhook | A signed server-to-server event from a payment provider indicating a payment state change. |
| RBAC | Role-based access control: permissions granted according to a user's assigned role. |
| MVP | Minimum viable product: the smallest release that delivers the core guest and hotel workflows. |

## Appendix B — Suggested Project Handover Artifacts

- Architecture diagram and deployment diagram.
- MongoDB schema/data dictionary and index plan.
- OpenAPI/Swagger specification or equivalent API documentation.
- Postman collection with environment variables and representative test cases.
- Role-permission matrix and booking/payment state-transition diagrams.
- Test plan, bug triage list, release checklist, and backup/restore instructions.
