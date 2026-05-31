# System Requirement Document (SRD)

> **Template** — Copy file ini ke root project sebagai `SRD.md`, lalu isi sesuai stack project lo.
> Generate otomatis via `project-init.md` (PHASE 0) atau isi manual.

---

## 1. System Overview

**Deskripsi sistem:** [1–2 kalimat yang jelasin sistem ini secara teknis]

**Architecture pattern:** [Monolith / Microservices / Serverless / JAMstack / dll]

**Deployment target:** [SaaS / Self-hosted / Hybrid]

---

## 2. Architecture

### Stack Choice

| Layer | Technology | Versi |
|---|---|---|
| Frontend | [React / Next.js / Vue / Svelte] | [versi] |
| Backend | [Node.js / Express / NestJS / Laravel / Go] | [versi] |
| Database | [PostgreSQL / MongoDB / MySQL] | [versi] |
| Cache | [Redis / Memcached / N/A] | [versi] |
| Hosting | [Vercel / Railway / AWS / VPS] | - |
| CDN | [Cloudflare / Vercel Edge / N/A] | - |

### High-Level Architecture

```
[Client (Browser/Mobile)]
        ↓ HTTPS
[CDN / Load Balancer]
        ↓
[Frontend (Next.js)]
        ↓ REST/GraphQL
[Backend API]
        ↓
[Database]  [Cache]  [External APIs]
```

---

## 3. Modules

### 3.1 Auth Module

**Tanggung jawab:** Authentication & authorization

**Komponen:**
- JWT-based authentication (access + refresh token)
- Role management (admin / user / guest)
- Password hashing (bcrypt / argon2)
- Session management

**Files:**
- `/api/auth/*` — endpoint
- `/lib/auth/*` — middleware & helper

### 3.2 [Module Name]

**Tanggung jawab:** [apa]

**Komponen:**
- [komponen #1]
- [komponen #2]

**Files:**
- [path file]

### 3.3 [Module Name]

**Tanggung jawab:** [apa]

**Komponen:**
- [komponen #1]

**Files:**
- [path file]

---

## 4. API Structure

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | - | Register user baru |
| POST | `/api/auth/login` | - | Login → return JWT |
| POST | `/api/auth/refresh` | refresh token | Refresh access token |
| POST | `/api/auth/logout` | bearer | Logout (invalidate session) |

### Core Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard` | bearer | Dashboard data |
| GET | `/api/[resource]` | bearer | List resource |
| POST | `/api/[resource]` | bearer | Create resource |
| GET | `/api/[resource]/:id` | bearer | Get single resource |
| PUT | `/api/[resource]/:id` | bearer | Update resource |
| DELETE | `/api/[resource]/:id` | bearer (admin) | Delete resource |

### Response Format (Standard)

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 100 }
}
```

### Error Format (Standard)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field 'email' is required",
    "details": { "field": "email" }
  }
}
```

---

## 5. Database Schema

### Users
```
id          UUID PK
email       VARCHAR UNIQUE NOT NULL
password    VARCHAR NOT NULL  -- bcrypt hashed
name        VARCHAR
role        ENUM('admin', 'user', 'guest') DEFAULT 'user'
created_at  TIMESTAMP DEFAULT NOW()
updated_at  TIMESTAMP
```

### [Resource Table]
```
id          UUID PK
user_id     UUID FK → users(id)
title       VARCHAR NOT NULL
description TEXT
status      ENUM(...)
created_at  TIMESTAMP DEFAULT NOW()
updated_at  TIMESTAMP
```

### Indexes
- `users(email)` — login lookup
- `[resource](user_id)` — query by owner
- `[resource](created_at DESC)` — sort by latest

---

## 6. Security

### Authentication & Authorization
- JWT dengan expiry 15 menit (access) + 7 hari (refresh)
- Refresh token disimpan HttpOnly cookie
- RBAC enforced di middleware level

### Input Validation
- Semua input user di-sanitize (DOMPurify untuk HTML, escape untuk SQL)
- Schema validation: Zod / Joi / Yup
- File upload: validasi MIME + size limit + virus scan

### Security Headers
```
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### API Security
- Rate limiting: 100 req/min per IP, 1000 req/min per user
- CORS: whitelist origin (no wildcard)
- HTTPS only (HSTS enforced)
- Error response: tidak expose stack trace

### Data Protection
- Password: bcrypt (cost 12) atau argon2id
- Sensitive data: encrypted at rest
- PII: di-mask di log
- Backup: encrypted + offsite

---

## 7. Performance

### Frontend
- Code splitting per route
- Lazy load komponen heavy
- Image optimization (WebP / AVIF, lazy loading)
- Font preload untuk above-the-fold
- Bundle size budget: < 200KB initial JS (gzipped)

### Backend
- DB query optimization (avoid N+1)
- Connection pooling
- Response caching (Redis) untuk read-heavy endpoint
- Pagination wajib untuk list endpoint

### Lighthouse Targets
- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

---

## 8. Deployment

### Environments
| Env | URL | Branch | Auto-deploy |
|---|---|---|---|
| Development | localhost | feature/* | - |
| Staging | staging.app.com | develop | ✓ |
| Production | app.com | main | manual approval |

### CI/CD Pipeline
1. Lint + type check
2. Unit test
3. Build
4. Audit pipeline (SAST + DAST + Lighthouse + WCAG)
5. Deploy ke staging
6. Smoke test
7. Manual approval
8. Deploy ke production

### Environment Variables
- `.env.example` di-commit (template)
- `.env` ada di `.gitignore`
- Production secrets via [Vault / AWS Secrets Manager / Vercel env]

---

## 9. Logging & Monitoring

### Logging
- Structured logging (JSON)
- Log levels: ERROR / WARN / INFO / DEBUG
- PII di-mask
- Retention: 30 hari (compliance check dulu)

### Monitoring
- Error tracking: Sentry
- Uptime: UptimeRobot / Better Uptime
- APM: [tool jika perlu]
- Real User Monitoring (RUM): [tool jika perlu]

### Alerting
- Error rate > 1% → page on-call
- p99 latency > 2s → warning
- Uptime < 99.9% → page

---

## 10. Testing Strategy

| Type | Tool | Coverage Target |
|---|---|---|
| Unit | Vitest / Jest | ≥ 70% |
| Integration | Vitest / Supertest | Critical paths |
| E2E | Playwright | Happy path + edge cases |
| Accessibility | axe-core | Setiap PR |
| Security | OWASP ZAP + npm audit | Pre-deploy |
| Performance | Lighthouse CI | Pre-deploy |

---

**Last updated:** [YYYY-MM-DD]
**Owner:** [nama / role]
**Status:** Draft / Review / Approved
