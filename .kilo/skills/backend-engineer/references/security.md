# Backend Security

OWASP Top 10, security best practices, and input validation.

## OWASP Top 10 (2025)

1. **Broken Access Control** – Restrictions on what authenticated users are allowed to do are not properly enforced.
2. **Cryptographic Failures** – Failures related to cryptography or the lack thereof, often leading to exposure of sensitive data.
3. **Injection** – Untrusted data is sent to an interpreter as part of a command or query, tricking the interpreter into executing unintended commands.
4. **Insecure Design** – Missing or ineffective security controls due to insecure design patterns or lack of threat modeling.
5. **Security Misconfiguration** – Incomplete or ad hoc configurations, open cloud storage, misconfigured HTTP headers, and verbose error messages.
6. **Vulnerable and Outdated Components** – Using components with known vulnerabilities, unsupported software, or outdated libraries.
7. **Identification and Authentication Failures** – Failures related to authentication or session management, allowing attackers to compromise passwords, keys, or session tokens.
8. **Software and Data Integrity Failures** – Code and infrastructure that do not protect against integrity violations, such as unsigned code or insecure CI/CD pipelines.
9. **Security Logging and Monitoring Failures** – Insufficient logging, detection, monitoring, and active response, allowing attackers to further attack systems, maintain persistence, pivot to more systems, or tamper, extract, or destroy data.
10. **Server-Side Request Forgery (SSRF)** – Web applications fetch remote resources without validating the user-supplied URL, allowing attackers to coerce the application to send requests to unintended destinations.

## Input Validation

### Principles

- Validate all inputs at API boundaries
- Whitelist over blacklist
- Validate type, format, length, range
- Sanitize before processing

### Examples

**Type Validation:**

```python
class ValidationError(Exception):
    pass

def validate_user_id(user_id: str) -> int:
    try:
        return int(user_id)
    except ValueError:
        raise ValidationError("Invalid user ID")
```

**Format Validation:**

```python
import re

def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))
```

## SQL Injection Prevention

**Always use parameterized queries:**

```python
# BAD - Vulnerable
query = f"SELECT * FROM users WHERE id = {user_id}"

# GOOD - Safe
query = "SELECT * FROM users WHERE id = %s"
cursor.execute(query, (user_id,))
```

## Parameterized PostgreSQL Query (Runnable Example)

Install dependencies:

```bash
pip install psycopg[binary]
```

Run with:

```bash
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
python pg_query_example.py
```

Example file:

```python
import os

import psycopg


DATABASE_URL = os.environ["DATABASE_URL"]


def find_user_by_email(email: str) -> tuple[int, str] | None:
    with psycopg.connect(DATABASE_URL) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id, email FROM users WHERE email = %s",
                (email,),
            )
            return cursor.fetchone()


if __name__ == "__main__":
    user = find_user_by_email("alice@example.com")
    print(user)
```

Minimal schema setup for local testing:

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE
);

INSERT INTO users (email)
VALUES ('alice@example.com')
ON CONFLICT (email) DO NOTHING;
```

Why this is the safe pattern:

- The SQL statement and user input stay separate, so injected SQL is treated as data.
- `cursor.execute(..., (email,))` handles escaping and quoting through the driver.
- The function returns a typed row shape that is easy to validate at the API boundary.

## Password Security

- Require passwords to be at least 12 characters long; do not rely on arbitrary complexity rules. Enforce blocklists for breached or common passwords, and require multi-factor authentication (MFA) for account protection.
- Never store plaintext passwords. Passwords must be hashed with a strong adaptive algorithm (e.g., bcrypt or Argon2) and salted.
- Implement password reset securely
- Rate limit login attempts

## Authentication

- OAuth 2.1 + PKCE for authorization
- JWT tokens with short expiration
- Refresh tokens for long sessions
- Secure token storage
- CSRF protection

## Security Headers

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

## Rate Limiting

- Implement rate limits to prevent abuse
- Different limits for authenticated vs anonymous
- Return 429 Too Many Requests when exceeded
- Log rate limit violations

## Secrets Management

- Never commit secrets to version control
- Use environment variables or secret managers
- Rotate secrets regularly
- Use different secrets for different environments

## Dependency Security

- Regularly update dependencies
- Use dependency scanning tools
- Review security advisories
- Pin dependency versions
- Use lock files
