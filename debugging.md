# Debugging: Duplicate Leave Balance Deduction

## 1. What Was Wrong

The approval operation was not executed atomically. Two approval requests for the same leave request were processed almost simultaneously due to the UI retrying after a timeout.

Both requests read the leave request while its status was still `PENDING`, and both proceeded to deduct the employee's annual leave balance before either request updated the leave request status to `APPROVED`.

As a result, the employee's leave balance was deducted twice.

---

## 2. Why the Balance Was Deducted Twice

The code performs multiple independent database operations without wrapping them in a transaction:

1. Read leave request.
2. Verify status is `PENDING`.
3. Read employee balance.
4. Deduct annual leave balance.
5. Update leave request status.
6. Publish approval event.

Because these operations are not executed atomically, two concurrent requests can interleave as follows:

```
Request A                     Request B
---------                     ---------

Read status=PENDING
                               Read status=PENDING

Read balance=10
                               Read balance=10

Deduct balance to 5
                               Deduct balance to 5 again (using stale data)

Update request APPROVED
                               Update request APPROVED
```

Both requests observe the same initial state and both perform the deduction before either one marks the leave request as approved.

This is a classic race condition caused by concurrent access.

---

## 3. Corrected Approach (Pseudocode)

The approval process should execute inside a database transaction while acquiring row-level locks.

```typescript
BEGIN TRANSACTION;

-- Lock the leave request
SELECT *
FROM leave_requests
WHERE id = ?
FOR UPDATE;

if (status != 'PENDING')
    return success if already APPROVED;
    throw ConflictError otherwise;

-- Lock employee row
SELECT *
FROM employees
WHERE id = ?
FOR UPDATE;

if (leaveType == 'ANNUAL') {

    if (annualLeaveBalance < daysRequested)
        throw UnprocessableError();

    UPDATE employees
    SET annualLeaveBalance =
        annualLeaveBalance - daysRequested;
}

UPDATE leave_requests
SET
    status = 'APPROVED',
    approvedBy = ?,
    approvedAt = NOW();

INSERT INTO outbox_events (...);

COMMIT;
```

The event should be published asynchronously from the Outbox table after the transaction commits.

---

## 4. Why This Fix Works

The transaction guarantees that either all changes succeed or none do.

Using `SELECT ... FOR UPDATE` locks both the leave request and employee rows until the transaction completes. If another approval request arrives while the first transaction is running, it must wait for the lock to be released.

When the second request finally acquires the lock, it re-reads the leave request and finds that its status is already `APPROVED`. It therefore exits without deducting the balance a second time.

This guarantees that:

* Leave balance is deducted exactly once.
* Status transitions are consistent.
* Concurrent approvals cannot corrupt data.

---

## 5. Additional Improvements to Prevent Recurrence

### Database Transaction

Wrap the entire approval workflow in a single transaction so that balance deduction and status update are committed together.

### Row-Level Locking

Use `SELECT ... FOR UPDATE` when retrieving both the leave request and employee records to prevent concurrent modifications.

### Status Transition Guard

Only allow the transition:

```
PENDING → APPROVED
```

Any request received after approval should immediately return without modifying data.

### Idempotency

Support an idempotency key (for example, an `Idempotency-Key` request header). If the same approval request is retried, return the original successful response instead of executing the workflow again.

### Outbox Pattern

Instead of publishing events directly after updating the database, write an event to an `outbox_events` table within the same transaction. A background worker can safely publish events exactly once, preventing duplicate notifications.
