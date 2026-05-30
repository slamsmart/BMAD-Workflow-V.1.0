# 🚀 AI Engineering Workflow (Security • Accessibility • Performance)

Opinionated workflow untuk memastikan aplikasi lo **aman, aksesibel, dan layak deploy** — otomatis.

---

## ⚙️ What This Is

Setup ini pakai **AI-driven pipeline** buat enforce:

* 🔐 Security (no critical vulnerabilities + DAST)
* ♿ Accessibility (WCAG 2.1 AA)
* ⚡ Performance (Lighthouse ≥ 90)
* 🤖 Auto-fix + auto-validation

Semua dijalankan lewat **1 unified agent**.

---

## 📁 Project Structure

```
/docs
  PRD.md                  ← Product requirements (isi untuk project lo)
  SRD.md                  ← System/tech requirements (isi untuk project lo)
  audit-checklist.md      ← Checklist audit manual
  accessibility-wcag.md   ← WCAG 2.1 guidelines

/ai
  bmad-main.md            ← ENTRY POINT UTAMA (mulai dari sini)
                             ↳ include: agent behavior, MCP rules, coding discipline, safety
  project-init.md         ← Onboarding project baru
  task-executor.md        ← Task breakdown & build execution
  auto-code-review.md     ← Code review agent
  bug-hunter.md           ← Debug & root cause agent
  auto-security-agent.md  ← Security + DAST + accessibility + lighthouse pipeline
```

> **Note:** `AGENTS.md` dan `system-prompt.md` sudah di-merge ke dalam `bmad-main.md`.
> Tidak perlu upload sebagai file terpisah.

---

## 🚀 Getting Started

### Project Baru? Mulai dari sini:

```
1. Upload bmad-main.md + SYSTEM_MAP.md ke Claude.ai
2. Ketik: "Jalankan PHASE 0: project-init"
3. Jawab 6 pertanyaan → PRD + SRD di-generate otomatis
4. Copy-paste output ke PRD.md dan SRD.md
5. Isi SYSTEM_MAP.md (PHASE 0.6)
6. Ketik: "Jalankan PHASE 1: task-executor"
```

### Project yang sudah jalan?

```
1. Upload bmad-main.md + SYSTEM_MAP.md + kode lo ke Claude.ai
2. Ketik: "Jalankan PHASE 3: full audit"
```

### Upload apa, kapan?

| Skenario | Upload ke Claude.ai |
|---|---|
| Setiap sesi (wajib) | `bmad-main.md` · `SYSTEM_MAP.md` |
| Project baru (P0) | + `project-init.md` |
| Coding (P1–2) | + `PRD.md` · `SRD.md` · `task-executor.md` |
| Audit (P3–4) | + `auto-security-agent.md` · `audit-checklist.md` · `accessibility-wcag.md` · kode final |

---

## 🧠 Core Concept

### Single Entry Point

Semua dimulai dari:

```
/ai/bmad-main.md
```

File ini adalah "peta" — mengarahkan ke agent yang tepat sesuai phase, sekaligus membawa semua behavior rules dan MCP config.

### Single Source of Truth (Audit)

Semua quality control dipegang oleh:

```
/ai/auto-security-agent.md
```

Ini yang jalanin: audit → fix → validation → enforcement.

---

## 🔁 Pipeline Flow

```
[PHASE 0]   project-init
             → generate PRD + SRD

[PHASE 0.5] visual insight
             → diagram arsitektur
             → user flow + wireframe kasar

[PHASE 0.6] isi SYSTEM_MAP.md
             → tech stack, entrypoints, flow, boundaries

[PHASE 1]   task-executor
             → breakdown tasks
             → file structure
             → implementation order

[PHASE 2]   build + iterate
             → code review (auto-code-review)
             → bug hunting (bug-hunter)
             → cek SYSTEM_MAP sebelum edit file

[PHASE 3]   audit pipeline
             → security audit + DAST (OWASP ZAP)
             → security fix
             → accessibility audit (WCAG)
             → accessibility fix
             → lighthouse audit

[PHASE 4]   CI gate
             → fail if score < 90
             → final validation & report
```

---

## 🔐 Security Rules

Minimal enforce:

* No hardcoded secrets
* No XSS / injection
* Secure headers (CSP, HSTS, X-Frame-Options, etc)
* HTTPS only
* Auth validation required

### 🕵️ DAST — Dynamic Application Security Testing

Dijalankan otomatis via **OWASP ZAP** sebagai bagian PHASE 3:

* Crawl semua endpoint yang terekspos
* Scan aktif: SQL injection, XSS, CSRF, path traversal, broken auth
* Scan pasif: info disclosure, insecure cookies, missing headers
* Output: laporan temuan per severity (Critical / High / Medium / Low)
* **Fail build jika ada temuan Critical atau High**

```bash
# Contoh jalankan ZAP headless
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://your-app-url \
  -r zap-report.html
```

> DAST dijalankan setelah app bisa diakses (staging / local dengan expose).
> Untuk API-only: gunakan `zap-api-scan.py` dengan OpenAPI spec lo.

**Fail build jika ada critical issue.**

---

## ♿ Accessibility (WCAG 2.1)

Standar minimum: **AA**

Cakupan:

* Semantic HTML
* Alt text (images)
* Keyboard navigation
* Focus visibility
* Form labels & error states
* Contrast ≥ 4.5:1

**Bukan optional.**

---

## ⚡ Lighthouse Enforcement

Semua kategori harus ≥ 90:

* Performance
* Accessibility
* Best Practices
* SEO

Kalau satu aja di bawah:

```
❌ BUILD FAIL
```

---

## 🧪 CI Integration

Gunakan Lighthouse CLI + OWASP ZAP + Node checker.

Flow:

1. Build app
2. Run DAST scan (ZAP)
3. Run Lighthouse
4. Parse semua result
5. Fail / pass otomatis

---

## 📊 Output Report

Contoh:

```json
{
  "security": {
    "critical": 0,
    "high": 0,
    "dast": {
      "tool": "OWASP ZAP",
      "alerts": 0,
      "status": "PASS"
    }
  },
  "accessibility": {
    "wcag_level": "AA"
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

## 🧠 Philosophy

* Satu pipeline, bukan banyak tools terpisah
* Fix > detect doang
* Enforce di CI, bukan manual review
* Quality itu **gated**, bukan optional

---

## 🚫 What This Is NOT

* Bukan boilerplate UI
* Bukan template frontend
* Bukan sekadar checklist

Ini **execution layer**.

---

## 🧱 Next Upgrade (Optional)

* PR-based auto review bot
* Performance budget (bundle size limit)
* Framework-specific agent (React / Next.js)
* Docker / Vercel pipeline integration
* Manual pentest checklist (OWASP Top 10) untuk pre-production
* Dependency vulnerability scan (npm audit / Snyk)

---

## 🏁 Bottom Line

Kalau lolos pipeline ini:

👉 App lo **aman, usable, dan layak deploy**
Bukan cuma "jalan".

---

## License

MIT (or customize sesuai kebutuhan)
