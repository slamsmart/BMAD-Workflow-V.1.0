# Accessibility Guidelines (WCAG-Based)

## Purpose

Dokumen ini memastikan UI/UX memenuhi standar aksesibilitas (WCAG 2.1) sehingga aplikasi dapat digunakan oleh semua pengguna, termasuk penyandang disabilitas.

Target: **WCAG 2.1 Level AA**

---

## Core Principles (POUR)

### 1. Perceivable

Konten harus bisa dilihat/didengar oleh semua user.

* Semua gambar wajib punya `alt text`
* Video harus ada subtitle/caption
* Jangan gunakan warna sebagai satu-satunya indikator
* Pastikan kontras warna cukup

---

### 2. Operable

UI harus bisa digunakan oleh semua metode input.

* Semua fitur bisa diakses via keyboard
* Gunakan `tab`, `enter`, `esc` dengan benar
* Hindari elemen yang butuh mouse-only interaction
* Berikan indikator fokus (focus state)

---

### 3. Understandable

UI harus mudah dipahami.

* Gunakan label jelas pada form
* Error message harus spesifik & membantu
* Konsisten dalam navigasi & layout
* Hindari istilah teknis yang tidak perlu

---

### 4. Robust

Kompatibel dengan berbagai device & assistive tech.

* Gunakan semantic HTML (`<button>`, `<nav>`, dll)
* Support screen reader
* Valid HTML structure

---

## Implementation Checklist

### Images & Media

* [ ] Semua `<img>` punya `alt`
* [ ] Decorative images gunakan `alt=""`
* [ ] Video memiliki caption

---

### Color & Contrast

* [ ] Kontras teks minimal 4.5:1
* [ ] UI tidak bergantung pada warna saja
* [ ] Mode gelap tetap readable

---

### Keyboard Navigation

* [ ] Semua interaksi bisa pakai keyboard
* [ ] Urutan tab logis
* [ ] Fokus terlihat jelas (`:focus` styling)

---

### Forms

* [ ] Semua input punya `<label>`
* [ ] Error message jelas & dekat dengan field
* [ ] Required field ditandai dengan jelas
* [ ] Validasi tidak hanya warna

---

### Buttons & Links

* [ ] Gunakan `<button>` untuk aksi
* [ ] Gunakan `<a>` untuk navigasi
* [ ] Jangan pakai `<div>` sebagai button
* [ ] Ukuran klik minimal cukup besar

---

### Typography

* [ ] Font readable (min 16px)
* [ ] Line height cukup (1.5)
* [ ] Hindari all-caps berlebihan

---

### Layout & Structure

* [ ] Gunakan heading berurutan (`h1 → h2 → h3`)
* [ ] Gunakan landmark (`<main>`, `<nav>`, `<footer>`)
* [ ] Struktur konsisten

---

### ARIA (Jika Diperlukan)

* [ ] Gunakan ARIA hanya jika HTML tidak cukup
* [ ] Hindari overuse ARIA
* [ ] Gunakan `aria-label`, `aria-live` jika perlu

---

## React-Specific Rules

* Gunakan semantic component (bukan `<div>` semua)
* Pastikan state update tidak merusak fokus
* Gunakan `useRef` untuk kontrol fokus jika perlu
* Hindari dynamic content tanpa notifikasi (gunakan `aria-live`)

---

## Common Violations (Auto Fail)

* Tidak ada alt text
* Tidak bisa navigasi dengan keyboard
* Kontras warna buruk
* Form tanpa label
* Button bukan button (pakai div)

---

## Testing Strategy

### Manual Testing

* Navigasi hanya pakai keyboard
* Test dengan screen reader
* Zoom hingga 200%

---

### Tools

* Lighthouse (Accessibility score)
* Axe DevTools
* WAVE

---

## AI Integration

* Jalankan setelah `react-doctor`
* Audit UI setiap PR
* Flag issue berdasarkan severity

---

## Severity Levels

### HIGH

* Tidak bisa digunakan oleh keyboard
* Tidak terbaca screen reader

### MEDIUM

* Kontras kurang
* Label tidak jelas

### LOW

* Minor UX issue

---

## Final Rule

Accessible design = better UX for everyone.

If UI only works for “normal users”, it is broken.
