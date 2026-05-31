# Product Requirement Document (PRD)

> **Template** — Copy file ini ke root project sebagai `PRD.md`, lalu isi sesuai project lo.
> Generate otomatis via `project-init.md` (PHASE 0) atau isi manual.

---

## 1. Overview

**Nama Produk:** [Isi Nama Project]

**Tujuan:** Membangun [jenis aplikasi] untuk [deskripsi singkat problem yang diselesaikan].

**One-liner:** [1 kalimat yang jelasin produk ini ke orang awam]

---

## 2. Problem Statement

**Masalah utama:**
- [Masalah konkret #1 yang dihadapi user]
- [Masalah konkret #2]
- [Masalah konkret #3]

**Siapa yang kena masalah ini:** [persona / role]

**Cost of inaction:** [Apa yang terjadi kalau masalah ini nggak diselesaikan?]

---

## 3. Goals & Objectives

**Primary goals:**
- [Goal #1 — measurable]
- [Goal #2 — measurable]
- [Goal #3 — measurable]

**Non-goals (out of scope):**
- [Hal yang sengaja TIDAK diselesaikan di V1]
- [Hal yang ditunda ke future scope]

---

## 4. Target Users

| Role | Deskripsi | Goals di Aplikasi |
|---|---|---|
| [Admin] | [siapa] | [apa yang mau dicapai] |
| [End User] | [siapa] | [apa yang mau dicapai] |
| [Stakeholder] | [siapa] | [apa yang mau dicapai] |

---

## 5. Core Features

> Maksimal 5–7 fitur utama. Lebih dari itu = scope creep.

### 5.1 Authentication
- Login / Register
- Role-based access control (RBAC)
- Password reset flow

### 5.2 [Fitur Utama #1]
- [Detail spesifik]
- [Acceptance criteria]

### 5.3 [Fitur Utama #2]
- [Detail spesifik]
- [Acceptance criteria]

### 5.4 [Fitur Utama #3]
- [Detail spesifik]
- [Acceptance criteria]

### 5.5 Data Management
- CRUD data utama
- Import / Export (jika perlu)
- Filter & search

---

## 6. User Flow

**Happy path utama:**

1. User membuka aplikasi
2. User login (atau register kalau belum punya akun)
3. User masuk ke dashboard
4. User mengakses fitur utama
5. User menyelesaikan task utama
6. Sistem konfirmasi sukses + simpan data

**Edge cases yang harus di-handle:**
- User belum login → redirect ke login
- User session expired → re-auth
- Network error → retry mechanism
- Validation error → feedback jelas

---

## 7. Success Metrics

**Adoption:**
- [ ] [X] user aktif dalam 1 bulan pertama
- [ ] [Y]% retention rate setelah 30 hari

**Performance:**
- [ ] Average task completion time < [Z] detik
- [ ] Error rate < 1%

**Quality:**
- [ ] Lighthouse score ≥ 90 (semua kategori)
- [ ] WCAG 2.1 AA compliant
- [ ] Zero critical security issue

---

## 8. Constraints

**Technical:**
- Stack sudah ditentukan (lihat SRD)
- [Browser support: ...]
- [Offline support: ya/tidak]

**Business:**
- Budget: [Rp ... atau N/A]
- Timeline: [target launch]
- Team size: [jumlah developer]

**Compliance:**
- [GDPR / UU PDP / dll. jika relevan]
- [Standar industri spesifik]

---

## 9. Future Scope

> Hal yang TIDAK dikerjakan sekarang, tapi sudah dipikir untuk nanti.

- [ ] Mobile native app (iOS / Android)
- [ ] Public API untuk integrasi 3rd-party
- [ ] AI feature (rekomendasi, auto-suggestion, dll.)
- [ ] Multi-tenant / white-label
- [ ] Advanced analytics dashboard

---

## 10. Open Questions

> Hal yang masih perlu diklarifikasi sebelum/saat development.

- [ ] [Pertanyaan #1]
- [ ] [Pertanyaan #2]

---

**Last updated:** [YYYY-MM-DD]
**Owner:** [nama / role]
**Status:** Draft / Review / Approved
