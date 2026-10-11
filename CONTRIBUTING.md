# Contributing to BursaLimbah.com

Terima kasih atas minat Anda untuk berkontribusi pada BursaLimbah.com!

## 📋 Status Proyek

Proyek ini saat ini bersifat **private** dan dikembangkan oleh tim internal. Namun, kami terbuka untuk kolaborasi dan feedback.

## 🤝 Cara Berkontribusi

### Untuk Tim Internal

1. **Fork & Branch**
   ```bash
   git checkout -b feature/nama-fitur
   # atau
   git checkout -b fix/nama-bug
   ```

2. **Development**
   - Ikuti coding standards yang sudah ada
   - Tulis test untuk fitur baru
   - Update dokumentasi jika perlu

3. **Commit**
   ```bash
   git commit -m "feat: deskripsi fitur"
   # atau
   git commit -m "fix: deskripsi bug fix"
   ```

   Format commit:
   - `feat:` untuk fitur baru
   - `fix:` untuk bug fix
   - `docs:` untuk dokumentasi
   - `style:` untuk formatting
   - `refactor:` untuk code refactoring
   - `test:` untuk menambahkan test
   - `chore:` untuk maintenance

4. **Push & Pull Request**
   ```bash
   git push origin feature/nama-fitur
   ```
   Buat Pull Request ke branch `main`

### Untuk External Contributors

Jika Anda ingin berkontribusi:

1. **Buka Issue** - Jelaskan fitur atau bug yang ingin Anda kerjakan
2. **Tunggu Approval** - Tim kami akan review dan memberikan feedback
3. **Fork & Develop** - Setelah disetujui, fork repository dan develop
4. **Submit PR** - Buat Pull Request dengan deskripsi yang jelas

## 🎨 Coding Standards

### TypeScript
- Gunakan strict mode
- Type semua variables dan functions
- Hindari `any` type
- Gunakan interfaces untuk objects

### React
- Functional components dengan hooks
- Pisahkan logic ke custom hooks
- Gunakan TypeScript untuk props
- Implementasi error boundaries

### Styling
- Gunakan Tailwind CSS
- Mobile-first approach
- Konsisten dengan design system
- Accessibility (WCAG 2.1 AA)

### Testing
- Unit tests untuk utilities
- Integration tests untuk components
- E2E tests untuk critical flows

## 📝 Documentation

- Update README.md jika ada perubahan signifikan
- Tambahkan JSDoc comments untuk public APIs
- Update DATABASE_SCHEMA.md jika ada perubahan schema
- Dokumentasikan API endpoints

## 🐛 Melaporkan Bug

Gunakan GitHub Issues dengan format:

```markdown
**Deskripsi Bug**
Deskripsi jelas dan singkat tentang bug

**Langkah Reproduksi**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
Apa yang seharusnya terjadi

**Actual Behavior**
Apa yang sebenarnya terjadi

**Screenshots**
Jika applicable

**Environment**
- OS: [e.g. Windows, macOS]
- Browser: [e.g. Chrome, Firefox]
- Version: [e.g. 1.0.0]
```

## 💡 Request Fitur

Gunakan GitHub Issues dengan label `enhancement`:

```markdown
**Deskripsi Fitur**
Deskripsi jelas tentang fitur yang diinginkan

**Use Case**
Bagaimana fitur ini akan digunakan

**Alternatif**
Solusi alternatif yang sudah dipertimbangkan

**Additional Context**
Informasi tambahan atau screenshots
```

## 📞 Kontak

Untuk pertanyaan tentang kontribusi:
- Email: info@bursalimbah.com
- Subject: [CONTRIBUTING] Your question

---

Terima kasih telah membantu membuat BursaLimbah.com lebih baik! 🌿
