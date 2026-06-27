# AI_REFLECTION.md

## 1. Which AI tools did you use, if any?

I used ChatGPT as a development assistant throughout the assessment. It was primarily used for brainstorming architecture, reviewing implementation ideas, and generating initial code examples.

---

## 2. How did you use them?

I used AI to accelerate development by:

* Discussing the overall project architecture.
* Reviewing PostgreSQL queries and business rule implementations.
* Exploring approaches for concurrency, transactions, and idempotency.
* Initial Drafting of documentations such as the README and design notes.

The generated content served as a starting point, which I reviewed, integrated, and adapted to fit my project structure and the assessment requirements.

---

## 3. Which generated code did you modify and why?

Several generated implementations were modified before being used, including:

* Adjusting import paths to match my project structure.
* Refactoring repository methods to use my shared `BaseRepository`.
* Correcting parameter mismatches between controllers, services, and repositories.
* Updating SQL queries to match my database schema.
* Improving error handling and validation.
* Organizing the application into a feature-based modular architecture.

These changes ensured the implementation aligned with my design decisions and functioned correctly within my application.

---

## 4. What AI suggestions did you reject and why?

I did not accept every suggestion as-is. I rejected or changed suggestions that:

* Did not match my folder structure.
* Introduced unnecessary complexity for the scope of the assessment.
* Assumed libraries or frameworks that were not part of the project.
* Did not fully align with the business rules provided in the specification.

Each suggestion was reviewed before being incorporated into the project.

---

## 5. What technical decisions were entirely yours?

The following decisions were my own:

* Choosing Express.js with the native PostgreSQL (`pg`) driver instead of an ORM.
* Designing the feature-based modular architecture using Controller–Service–Repository layers.
* Using a shared `BaseRepository` to centralize database access.
* Scoping all queries by `tenant_id` for multi-tenant isolation.
* Organizing routes under `/api/v1`.
* Separating business logic from database access.
* Implementing validation within the service layer.
* Choosing PostgreSQL transactions and row-level locking as the preferred approach for preventing duplicate approvals.

---

## 6. What part of the work would you be most comfortable defending in a technical interview?

I would be most comfortable discussing the overall system architecture and the reasoning behind the business logic implementation.

In particular, I can explain:

* The layered architecture (Controller → Service → Repository).
* Multi-tenant design using `tenant_id`.
* Validation of leave submission business rules.
* Why transactions and row-level locking are necessary.
* Idempotency and duplicate request handling.

While AI assisted with drafting and exploration, I understand the implementation decisions, can explain the trade-offs made, and would be comfortable discussing or extending the solution during a technical interview.