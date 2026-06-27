## 1. Scaling Leave Submissions

As the number of tenants and users grows, the leave submission endpoint should remain stateless so that multiple application instances can run behind a load balancer. PostgreSQL should use proper indexing on frequently queried columns such as `tenant_id`, `employee_id`, `status`, and date fields to optimize lookups and overlap checks.

To handle spikes (for example, every Friday at 4 PM), I would:

* Run multiple API instances behind a load balancer.
* Use connection pooling for PostgreSQL.
* Add indexes for common filters and overlap validation.
* Cache infrequently changing reference data such as leave policies.
* Keep leave submission synchronous but move non-critical work (notifications, emails, analytics) to background workers.

### Metrics to Monitor

* API latency (P50, P95, P99)
* Requests per second
* Database query execution time
* Connection pool utilization
* Error rate
* Queue length for background jobs
* CPU and memory usage

---

## 2. Duplicate Event Processing

Message queues typically provide **at-least-once delivery**, meaning the same event may be delivered multiple times.

To prevent duplicate processing:

* Include a globally unique `eventId` in every event.
* Each consumer stores processed event IDs in a database table.
* Before processing, the consumer checks whether the event has already been handled.
* If the event already exists, it acknowledges the message without executing the business logic again.

I would also use the **Transactional Outbox Pattern**, where the leave approval and event creation occur in the same database transaction. A background worker publishes events from the outbox, ensuring events are not lost or published twice.

---

## 3. Audit Logging

Audit logs should be immutable and should not impact API response time.

I would create a dedicated `audit_logs` table containing:

* Audit ID
* Tenant ID
* Leave Request ID
* Action (APPROVED, REJECTED)
* Previous Status
* New Status
* Performed By
* Timestamp
* Metadata (JSON)

The audit record would be written within the same database transaction as the leave update to guarantee consistency. If the volume grows significantly, audit records can be asynchronously replicated to a reporting or analytics database for long-term storage and querying.

---

## 4. Sync vs Async Balance Deduction

I would perform annual leave balance deduction **synchronously** within the approval API.

The leave balance is part of the core business transaction. If the balance update fails while the request is approved, the system becomes inconsistent.

Using a single database transaction ensures that:

* The leave is approved exactly once.
* The balance is deducted exactly once.
* Both operations either succeed or fail together.

Asynchronous processing would improve response time but introduces eventual consistency, retry complexity, and reconciliation logic, making it less suitable for financial or leave balance data.

I would keep balance deduction synchronous while moving secondary tasks such as notifications, emails, and reporting to background workers.

---

## 5. Monolith vs Microservice

At the current scale (approximately 500 companies), I would keep leave management inside the main HR application as a modular monolith.

A modular monolith provides:

* Simpler deployments.
* Easier debugging.
* Strong transactional consistency.
* Lower operational complexity.
* Faster feature development.

I would consider extracting a dedicated Leave Service when:

* Teams begin working independently on leave management.
* Leave processing experiences significantly different scaling requirements.
* Independent deployments become necessary.
* The leave module becomes a bottleneck for the rest of the system.

Splitting too early introduces distributed transactions, network latency, service discovery, API versioning, duplicate data synchronization, and eventual consistency challenges before the benefits outweigh the added complexity.


## Product & Engineering Judgment

### Scenario A – The Quick Win

#### Risks

Simply changing an approved leave request back to `PENDING` introduces serious data integrity issues:

* The employee's annual leave balance would remain deducted unless manually restored.
* Payroll may have already consumed the approval event, leading to incorrect salary calculations.
* Notifications already sent to employees and managers would become inaccurate.
* The audit trail would no longer accurately reflect the sequence of actions.
* The system could end up in an inconsistent state where different services have conflicting information.

In a production environment, this could result in compliance issues and incorrect HR records.

#### Recommendation

I would explain to the Product Manager that changing only the status creates technical debt and risks corrupting business data. Instead of modifying existing state, I would recommend implementing a proper **Cancel Approved Leave** workflow that:

* Restores the leave balance.
* Records an immutable audit entry.
* Notifies downstream systems (Payroll, Notifications).
* Marks the request as `CANCELLED` instead of reverting it to `PENDING`.

Although this requires more engineering effort, it preserves system integrity.

#### What I Would Ship for the Demo

For a demo environment, I would implement a clearly labeled **Demo Only** action that:

* Is available only in non-production environments.
* Changes the status while displaying a warning that balance restoration, payroll integration, and notifications are not part of the demonstration.
* Cannot be enabled in production through configuration.

This allows the sales demo to proceed without introducing production risk.

#### What I Would Refuse to Ship

I would refuse to deploy a production feature that simply changes an approved leave request back to `PENDING` without:

* Restoring leave balance.
* Recording an audit trail.
* Handling payroll implications.
* Notifying dependent systems.

Shipping a shortcut that knowingly compromises data integrity would create operational risk and could undermine trust in the HR platform.


### Scenario B – Consistency vs Performance

#### Tradeoffs

Reading the leave balance directly from the database guarantees that users always see the latest value, but each request incurs an additional database query (approximately 80 ms). As traffic grows, this increases database load and response time.

Caching the balance in Redis reduces read latency significantly (approximately 5 ms) and decreases database load. However, cached data may be stale for up to 60 seconds, meaning users could temporarily see an incorrect leave balance immediately after an approval or cancellation.

#### Recommendation

For an HR and payroll-adjacent system, I would prioritize **strong consistency** over maximum performance. Leave balances affect employee entitlements and payroll calculations, so displaying stale data could lead to incorrect business decisions and reduced user trust.

Therefore, I would use the database as the source of truth for balance-related operations and user-facing screens where accuracy is critical.

#### Mitigating the Downside

To reduce the performance impact while maintaining consistency, I would:

* Ensure proper indexing on employee and leave-related tables.
* Use connection pooling to optimize database access.
* Cache only non-critical reference data (e.g., leave policies) rather than transactional balances.
* If Redis is introduced, use a **cache-aside** strategy with immediate cache invalidation or update whenever a leave approval or cancellation commits successfully, instead of relying solely on a fixed 60-second TTL.
* Continuously monitor database latency, cache hit rate, and API response times to determine when further optimization is required.

This approach provides accurate leave balances while still allowing caching to improve performance where eventual consistency is acceptable.
