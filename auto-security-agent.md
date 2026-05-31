# AUTO SECURITY + ACCESSIBILITY + LIGHTHOUSE AGENT

## EXTENDED PIPELINE

1. Code Scan (Static) — npm audit + gitleaks + Snyk
2. SAST — code analysis (CodeQL + manual checklist)
3. Security Auto-Fix
4. DAST — Dynamic Application Security Testing (OWASP ZAP)
5. Container Scan (Trivy) — kalau ada Dockerfile
6. Accessibility Audit (WCAG 2.1 AA) — axe-core
7. Accessibility Auto-Fix
8. Lighthouse Audit
9. CI Gate (Fail if < 90 or critical issue found)
10. Final Validation & Report

---

## 🛠️ TOOL STACK (Layered Defense)

| Layer | Tool | Coverage | Free? |
|---|---|---|---|
| Dependency vulns | `npm audit` | Known CVEs | ✓ |
| Dependency vulns (deeper) | **Snyk** | License + transitive | Free tier |
| Dependency auto-update | **Dependabot** | Weekly PR auto-bump | ✓ (GitHub) |
| Secret scanning | **gitleaks** | Code + git history | ✓ |
| SAST | **CodeQL** | Code patterns, taint analysis | ✓ (public + GHES) |
| DAST | **OWASP ZAP** | Runtime, dynamic | ✓ |
| Container | **Trivy** | OS + lib vulns | ✓ |
| Accessibility | **axe-core** | WCAG 2.1 A/AA | ✓ |
| Performance | **Lighthouse** | Perf/a11y/BP/SEO | ✓ |

> **Configuration:** semua tool ini sudah di-wire di `.github/workflows/security-scan.yml` (security) dan `.github/workflows/audit-pipeline.yml` (audit).
> Dependabot config: `.github/dependabot.yml`.
> CI gate aggregator: `scripts/ci-gate.js`.

---

## 1. CODE SCAN (STATIC)

Scan sebelum audit — tangkap hal obvious dulu.

### Checks:
* Hardcoded secrets / API keys / tokens
* `.env` tidak ter-commit
* `console.log` sensitif
* Dependencies dengan known vulnerabilities
* Outdated dependencies dengan known CVEs (Snyk)

### Tools:
```bash
# 1. npm audit (built-in, baseline)
npm audit --audit-level=high

# 2. Snyk (deeper analysis, license check)
npx snyk@latest test --severity-threshold=high
npx snyk@latest monitor  # continuous monitoring

# 3. Secret scanning — gitleaks (lebih akurat dari grep)
docker run --rm -v $(pwd):/path ghcr.io/gitleaks/gitleaks:latest \
  detect --source /path -v

# 4. Outdated package check
npm outdated
```

### Fail jika:
* `npm audit` return severity `high` atau `critical`
* Snyk find vulnerability dengan severity `high` atau `critical`
* Secret / credential ditemukan di source atau git history

---

## 2. SECURITY AUDIT (SAST)

Review kode untuk vulnerability pattern secara statis.

### Checklist:

#### Authentication & Authorization
- [ ] Auth check ada di semua protected route
- [ ] Session token tidak expose di URL / log
- [ ] Token expiry diimplementasi
- [ ] Password tidak disimpan plaintext (gunakan bcrypt / argon2)
- [ ] Privilege escalation tidak mungkin terjadi

#### Input Validation & Injection
- [ ] Semua input user di-sanitize sebelum diproses
- [ ] Query DB pakai parameterized query / ORM (no raw string concat)
- [ ] File upload: validasi tipe + ukuran + scan content
- [ ] No `eval()` atau `Function()` dengan input user

#### XSS Prevention
- [ ] Output di-escape sebelum render ke HTML
- [ ] CSP header diset (minimal `default-src 'self'`)
- [ ] `dangerouslySetInnerHTML` (React) / `v-html` (Vue) tidak dipakai sembarangan
- [ ] Cookie: `HttpOnly`, `Secure`, `SameSite=Strict`

#### Security Headers
- [ ] `Content-Security-Policy`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Strict-Transport-Security` (HSTS)
- [ ] `Referrer-Policy: no-referrer`
- [ ] `Permissions-Policy`

#### API Security
- [ ] Rate limiting aktif
- [ ] CORS dikonfigurasi strict (bukan `*`)
- [ ] Error response tidak expose stack trace / internal info
- [ ] Endpoint sensitif tidak publicly accessible tanpa auth

#### Data Handling
- [ ] Data sensitif tidak di-log
- [ ] PII tidak disimpan lebih lama dari perlu
- [ ] Enkripsi at-rest untuk data sensitif

### Severity Classification:
| Severity | Contoh | Action |
|----------|--------|--------|
| Critical | Hardcoded credential, SQL injection, RCE | Fix sekarang, block deploy |
| High | Missing auth check, XSS, IDOR | Fix sekarang, block deploy |
| Medium | Missing security header, verbose error | Fix sebelum release |
| Low | Console log, dead code | Fix kapanpun |

---

## 3. SECURITY AUTO-FIX

Jalankan setelah audit — fix issue yang teridentifikasi.

### Auto-fixable:
```bash
# Update dependencies dengan vulnerability
npm audit fix

# Fix dengan force (breaking changes — review dulu)
npm audit fix --force
```

### Manual fix priority order:
1. Critical → High → Medium → Low
2. Fix satu per satu, test setelah tiap fix
3. Jangan bundle unrelated changes dengan security fix

### Verifikasi post-fix:
```bash
# Re-run audit pastikan bersih
npm audit --audit-level=high
```

---

## 4. DAST — DYNAMIC APPLICATION SECURITY TESTING

Dijalankan setelah app running (staging / local dengan expose).

### Tool: OWASP ZAP

> **Image migration note:** Image lama `owasp/zap2docker-stable` sudah deprecated (Docker Hub repo archived sejak 2024).
> Pakai image resmi yang aktif di-maintain: `ghcr.io/zaproxy/zaproxy:stable`.
> Reference: https://www.zaproxy.org/docs/docker/

#### Setup:
```bash
# Pull ZAP image (resmi, maintained)
docker pull ghcr.io/zaproxy/zaproxy:stable
```

#### Baseline Scan (web app — pasif, ~2 menit):
```bash
docker run --rm -v $(pwd):/zap/wrk/:rw \
  -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t https://your-app-url \
  -r zap-report.html \
  -J zap-report.json
```

#### Full Scan (aktif + pasif, ~10–30 menit):
```bash
docker run --rm -v $(pwd):/zap/wrk/:rw \
  -t ghcr.io/zaproxy/zaproxy:stable zap-full-scan.py \
  -t https://your-app-url \
  -r zap-report-full.html \
  -J zap-report-full.json
```

#### API Scan (untuk REST API dengan OpenAPI spec):
```bash
docker run --rm -v $(pwd):/zap/wrk/:rw \
  -t ghcr.io/zaproxy/zaproxy:stable zap-api-scan.py \
  -t https://your-app-url/openapi.json \
  -f openapi \
  -r zap-api-report.html
```

> **Catatan:** Flag `-v $(pwd):/zap/wrk/:rw` perlu supaya report file (HTML/JSON) keluar ke working directory host, bukan stuck di dalam container.

### Scope DAST scan:
* SQL Injection
* XSS (Reflected + Stored)
* CSRF
* Path Traversal
* Broken Authentication
* Insecure Direct Object Reference (IDOR)
* Security Misconfiguration
* Missing security headers
* Insecure cookies

### Parse Result:
```js
const zapReport = JSON.parse(fs.readFileSync("./zap-report.json"));
const alerts = zapReport.site[0].alerts;

const critical = alerts.filter(a => a.riskdesc.startsWith("High"));
const high     = alerts.filter(a => a.riskdesc.startsWith("Medium"));

if (critical.length > 0) {
  console.error("❌ DAST: Critical/High alerts found:", critical.length);
  process.exit(1);
}
```

### Fail jika:
* Alert severity `High` (ZAP) > 0 → **BLOCK DEPLOY**
* Alert severity `Medium` > 0 → **WARNING, fix sebelum release**

---

## 5. ACCESSIBILITY AUDIT (WCAG 2.1 AA)

### Tools:
```bash
# axe-core via CLI
npx axe http://localhost:3000 --exit

# atau via playwright
npx playwright test --config=a11y.config.ts
```

### Checklist WCAG 2.1 AA (POUR):

#### Perceivable
- [ ] Alt text pada semua gambar non-dekoratif (`alt=""` untuk dekoratif)
- [ ] Kontras warna ≥ 4.5:1 (teks normal), ≥ 3:1 (teks besar / UI component)
- [ ] Konten tidak hanya mengandalkan warna untuk menyampaikan info
- [ ] Video punya caption / transcript
- [ ] Tidak ada konten yang berkedip > 3x per detik

#### Operable
- [ ] Semua fungsi bisa diakses via keyboard (Tab, Enter, Space, Arrow)
- [ ] Focus indicator terlihat jelas (tidak `outline: none` tanpa pengganti)
- [ ] Skip navigation link ada di halaman dengan konten panjang
- [ ] Timeout ada peringatan + opsi extend
- [ ] Tidak ada keyboard trap

#### Understandable
- [ ] `<html lang="...">` diset
- [ ] Label pada semua form input (`<label>` atau `aria-label`)
- [ ] Error message jelas + mengarahkan ke field yang salah
- [ ] Konsistensi navigasi dan labeling antar halaman

#### Robust
- [ ] HTML valid (tidak ada unclosed tag, duplicate ID)
- [ ] ARIA role dipakai dengan benar (bukan asal tambah)
- [ ] Tidak bergantung pada CSS untuk urutan konten yang bermakna

### Severity:
| Level | Action |
|-------|--------|
| Critical (A) | Block deploy |
| High (AA) | Block deploy |
| Medium | Fix sebelum release |
| Low | Fix kapanpun |

---

## 6. ACCESSIBILITY AUTO-FIX

### Auto-fixable via axe:
```bash
npx axe http://localhost:3000 --exit --save axe-results.json
```

### Common manual fixes:
```html
<!-- Missing alt -->
<img src="banner.jpg" alt="Deskripsi banner produk">

<!-- Missing label -->
<label for="email">Email</label>
<input id="email" type="email" name="email">

<!-- Fix focus visible -->
:focus-visible {
  outline: 2px solid #0f3460;
  outline-offset: 2px;
}

<!-- Fix lang -->
<html lang="id">
```

---

## 7. LIGHTHOUSE AUDIT

### Metrics:
* Performance
* Accessibility
* Best Practices
* SEO

### Target Score:
* Minimum: **90 (ALL categories)**
* Ideal: 95+

### CLI Command:
```bash
npx lighthouse http://localhost:3000 \
  --output=json \
  --output-path=./lighthouse-report.json \
  --chrome-flags="--headless"
```

### Parse Result:
```js
const scores = {
  performance:   report.categories.performance.score * 100,
  accessibility: report.categories.accessibility.score * 100,
  bestPractices: report.categories["best-practices"].score * 100,
  seo:           report.categories.seo.score * 100,
};
```

---

## 8. CI GATE (AUTO FAIL)

### Rules:
* Security critical/high > 0 → **FAIL**
* DAST High alert > 0 → **FAIL**
* WCAG Level A/AA violation → **FAIL**
* Lighthouse score < 90 (any category) → **FAIL**
* Semua clear → **PASS**

### Example Script (Node.js):
```js
const fs = require("fs");

// Lighthouse check
const report  = JSON.parse(fs.readFileSync("./lighthouse-report.json"));
const scores  = {
  performance:   report.categories.performance.score * 100,
  accessibility: report.categories.accessibility.score * 100,
  bestPractices: report.categories["best-practices"].score * 100,
  seo:           report.categories.seo.score * 100,
};
const lhFailed = Object.values(scores).some(s => s < 90);

// DAST check
const zap      = JSON.parse(fs.readFileSync("./zap-report.json"));
const alerts   = zap.site[0].alerts;
const dastFail = alerts.some(a => a.riskdesc.startsWith("High"));

console.log("Lighthouse:", scores);
console.log("DAST High alerts:", alerts.filter(a => a.riskdesc.startsWith("High")).length);

if (lhFailed || dastFail) {
  if (lhFailed)  console.error("❌ Lighthouse check failed (score < 90)");
  if (dastFail)  console.error("❌ DAST: High severity alerts found");
  process.exit(1);
} else {
  console.log("✅ All checks passed");
}
```

---

## CI INTEGRATION (GITHUB ACTIONS)

### `.github/workflows/audit-pipeline.yml`

```yaml
name: Audit Pipeline

on:
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install deps
        run: npm ci

      - name: Dependency vulnerability scan
        run: npm audit --audit-level=high

      - name: Build app
        run: npm run build

      - name: Start app
        run: npm start &

      - name: Wait for server
        run: npx wait-on http://localhost:3000 --timeout 60000

      - name: DAST Scan (OWASP ZAP)
        run: |
          docker run --rm -v ${{ github.workspace }}:/zap/wrk/:rw \
            -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
            -t http://host.docker.internal:3000 \
            -J zap-report.json || true

      - name: Run Lighthouse
        run: |
          npx lighthouse http://localhost:3000 \
            --output=json \
            --output-path=./lighthouse-report.json \
            --chrome-flags="--headless --no-sandbox"

      - name: Run axe Accessibility Check
        run: npx @axe-core/cli http://localhost:3000 --exit

      - name: CI Gate — Validate All Scores
        run: node ci-gate.js

      - name: Upload Reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: audit-reports
          path: |
            lighthouse-report.json
            zap-report.json
```

> **Versi GitHub Actions:** `actions/checkout@v3` dan `actions/upload-artifact@v3` sudah deprecated (EOL Januari 2025). Sudah di-update ke v4.

---

## 9. FINAL REPORT FORMAT

```json
{
  "security": {
    "critical": 0,
    "high": 0,
    "dast": {
      "tool": "OWASP ZAP",
      "high_alerts": 0,
      "medium_alerts": 0,
      "status": "PASS"
    }
  },
  "accessibility": {
    "wcag_level": "AA",
    "violations": 0,
    "status": "PASS"
  },
  "lighthouse": {
    "performance": 92,
    "accessibility": 95,
    "best_practices": 90,
    "seo": 91
  },
  "status": "PASS"
}
```

---

## HARD RULES

Build harus gagal kalau:
* Security critical/high > 0
* DAST high alert > 0
* WCAG Level A atau AA violation ditemukan
* Lighthouse score < 90 (kategori manapun)

---

## REALITY CHECK

* Skor 90 itu **baseline**, bukan "bagus banget"
* Performance paling susah tembus 90 → optimasi:
  * image size + format (WebP/AVIF)
  * lazy loading
  * bundle splitting + tree shaking
  * font preload
* DAST baseline scan cukup untuk pre-deploy — full scan untuk pre-release besar
* WCAG AA itu minimum; kalau target publik luas, pertimbangkan AAA untuk komponen kritis

---

## END
