---
name: validating-database-integrity
description: |
  Process use when you need to ensure database integrity through comprehensive data validation.
  This skill validates data types, ranges, formats, referential integrity, and business rules.
  Trigger with phrases like "validate database data", "implement data validation rules",
  "enforce data integrity constraints", or "validate data formats".
---

# Data Validation Engine

## Overview

Implement and enforce data integrity rules at the database level using CHECK constraints, triggers, foreign keys, and custom validation functions. Guidance is provided for both PostgreSQL and MySQL, with dialect-specific examples and notes.

## Prerequisites

- Database credentials with ALTER TABLE and CREATE FUNCTION permissions
- `psql` or `mysql` CLI for executing validation queries
- Current schema documentation or access to `information_schema` for column specifications
- Business rules document describing valid data ranges, formats, and relationships
- Backup of production data before applying new constraints (constraints may reject existing invalid data)

## Instructions

### PostgreSQL

**Note:** PostgreSQL supports advanced validation features such as FILTER in aggregates, regex operators (~~, !~~), and deferred constraint validation (NOT VALID / VALIDATE CONSTRAINT).

1. Audit existing data quality by running validation queries before adding constraints. For NULL checks:
   `SELECT 'my_col' AS col, COUNT(*) FILTER (WHERE my_col IS NULL) AS null_count, COUNT(*) AS total FROM table_name;`
   Replace `my_col` with the actual column name. Repeat for each required column.

2. Detect orphaned records (broken referential integrity):
   For mandatory (NOT NULL) foreign key columns (`c.parent_id`), use:
   `SELECT c.id FROM child_table c LEFT JOIN parent_table p ON c.parent_id = p.id WHERE p.id IS NULL;`
   For optional (nullable) foreign key columns, add a predicate to exclude NULLs in `c.parent_id`:
   `SELECT c.id FROM child_table c LEFT JOIN parent_table p ON c.parent_id = p.id WHERE p.id IS NULL AND c.parent_id IS NOT NULL;`
   This ensures that only true orphans (where `c.parent_id` references a missing `p.id`) are detected, and rows with `c.parent_id IS NULL` (no parent) are not incorrectly flagged as orphans.

3. Validate data format compliance:
   - Email: `SELECT email FROM users WHERE email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'`
   - Phone: `SELECT phone FROM contacts WHERE phone !~ '^\+?[1-9]\d{6,14}$'`
   - URL: `SELECT url FROM links WHERE url !~ '^https?://.+'`
   - Date ranges: `SELECT * FROM events WHERE start_date > end_date`

4. Check numeric range violations:
   `SELECT * FROM products WHERE price < 0 OR price > 999999.99`
   `SELECT * FROM users WHERE age < 0 OR age > 150`

5. Identify duplicate records:
   `SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1`

6. Generate CHECK constraints for validated rules:
   - `ALTER TABLE products ADD CONSTRAINT chk_price_positive CHECK (price >= 0)`
   - `ALTER TABLE users ADD CONSTRAINT chk_email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')`
   - `ALTER TABLE events ADD CONSTRAINT chk_date_order CHECK (start_date <= end_date)`
   - `ALTER TABLE orders ADD CONSTRAINT chk_status_valid CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'))`

7. Create foreign key constraints with appropriate cascade behavior:
   - `ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT`
   - Use `ON DELETE CASCADE` for dependent data
   - Use `ON DELETE SET NULL` for optional relationships

8. Implement complex business rule validation using triggers as needed.

9. **Deferred constraint validation:**
   - Phase 1: Run validation queries, clean up data.
   - Phase 2: Apply constraints with `NOT VALID`: `ALTER TABLE users ADD CONSTRAINT chk_email CHECK (email ~ '...') NOT VALID;`
   - Then validate: `ALTER TABLE users VALIDATE CONSTRAINT chk_email;`

10. Generate a data quality report summarizing violations, cleanup, and constraints applied.

### MySQL

**Note:** MySQL does not support FILTER in aggregates or PostgreSQL's regex operators. Use CASE for conditional aggregates and REGEXP/NOT REGEXP or REGEXP_LIKE() for pattern matching. MySQL enforces CHECK constraints immediately (no NOT VALID/VALIDATE CONSTRAINT equivalent). CHECK constraints require MySQL 8.0.16+.

1. Audit NULLs (no FILTER):
   `SELECT 'my_col' AS col, SUM(CASE WHEN my_col IS NULL THEN 1 ELSE 0 END) AS null_count, COUNT(*) AS total FROM table_name;`

2. Detect orphaned records:
   `SELECT c.id FROM child_table c LEFT JOIN parent_table p ON c.parent_id = p.id WHERE p.id IS NULL;`

3. Validate data format compliance:
   - Email: `SELECT email FROM users WHERE email NOT REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'`
   - Phone: `SELECT phone FROM contacts WHERE phone NOT REGEXP '^\\+?[1-9]\\d{6,14}$'`
   - URL: `SELECT url FROM links WHERE url NOT REGEXP '^https?://.+'`
   - Date ranges: `SELECT * FROM events WHERE start_date > end_date`

4. Check numeric range violations:
   `SELECT * FROM products WHERE price < 0 OR price > 999999.99`
   `SELECT * FROM users WHERE age < 0 OR age > 150`

5. Identify duplicate records:
   `SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1`

6. Generate CHECK constraints (MySQL 8.0.16+):
   - `ALTER TABLE products ADD CONSTRAINT chk_price_positive CHECK (price >= 0)`
   - `ALTER TABLE users ADD CONSTRAINT chk_email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')`
   - `ALTER TABLE events ADD CONSTRAINT chk_date_order CHECK (start_date <= end_date)`
   - `ALTER TABLE orders ADD CONSTRAINT chk_status_valid CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'))`

7. Create foreign key constraints with appropriate cascade behavior (same syntax as PostgreSQL).

8. Implement triggers for complex business rules as needed.

9. **No deferred validation:** MySQL enforces CHECK constraints immediately. Clean up data before applying constraints.

10. Generate a data quality report as above.

## Output

- **Data quality audit report** with violation counts, examples, and severity ratings
- **Data cleanup scripts** (SQL) to fix violations before constraint application
- **Constraint DDL scripts** with CHECK, FOREIGN KEY, NOT NULL, and UNIQUE constraints
- **Validation triggers** for complex business rules beyond simple constraints
- **Ongoing validation queries** for periodic data quality monitoring

## Error Handling

| Error                                                  | Cause                                                    | Solution                                                                                                                                                            |
| ------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `check constraint violated by existing row`            | Existing data fails the new constraint                   | Run the validation query first to find violations; clean up data; use `NOT VALID` option to add constraint without checking existing data, then validate separately |
| `cannot add foreign key: referenced row not found`     | Orphaned child records reference non-existent parent     | Clean up orphaned records first with DELETE or UPDATE to valid parent; or insert missing parent records                                                             |
| `column cannot be made NOT NULL: contains NULL values` | Existing rows have NULL in the target column             | Backfill NULLs with `UPDATE table SET column = default_value WHERE column IS NULL` before adding NOT NULL                                                           |
| Trigger function causes performance regression         | Complex validation logic executes on every INSERT/UPDATE | Optimize trigger function; use WHEN clause to limit trigger firing; consider CHECK constraints instead of triggers for simple rules                                 |
| Circular foreign key prevents constraint creation      | Tables reference each other, preventing creation order   | Use `ALTER TABLE ADD CONSTRAINT` after both tables exist; or use `DEFERRABLE INITIALLY DEFERRED` constraints                                                        |

## Examples

### PostgreSQL Example

**Auditing a legacy database with 50,000 invalid email addresses**: Validation query reveals 50,000 of 2M user records have invalid email formats (missing @, double dots, spaces). A cleanup script normalizes common issues (trim whitespace, lowercase) and flags 3,000 unfixable records for manual review. After cleanup, a CHECK constraint with regex validation is applied using `~` and deferred with `NOT VALID`/`VALIDATE CONSTRAINT`.

### MySQL Example

**Auditing a legacy database with 50,000 invalid email addresses**: Validation query reveals 50,000 of 2M user records have invalid email formats. Cleanup and normalization are performed. CHECK constraints are applied using `REGEXP` (MySQL 8.0.16+). No deferred validation—data must be clean before constraint is added.

### Referential Integrity (Both)

**Enforcing referential integrity on a database without foreign keys**: Application-level FK enforcement led to orphans. Cleanup scripts archive orphans, then foreign key constraints are added. Syntax is similar in both PostgreSQL and MySQL.

### Business Rules (Both)

**Implementing business rules for a financial application**: Constraints enforce: account balance cannot be negative, transfer amount must be positive, transaction date cannot be in the future, and a trigger prevents unauthorized transfers. Use dialect-appropriate CHECK and trigger syntax.

## Resources

- PostgreSQL CHECK constraints: https://www.postgresql.org/docs/current/ddl-constraints.html
- PostgreSQL triggers: https://www.postgresql.org/docs/current/triggers.html
- MySQL CHECK constraints (8.0.16+): https://dev.mysql.com/doc/refman/8.0/en/create-table-check-constraints.html
- Data validation patterns: https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-CHECK-CONSTRAINTS
- NOT VALID constraint option: https://www.postgresql.org/docs/current/sql-altertable.html
