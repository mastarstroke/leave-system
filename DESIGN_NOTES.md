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
