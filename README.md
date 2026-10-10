# Lexiscene

**EN** Vocabulary learning app built around video transcripts: synced transcripts, tap-to-lookup words, spaced repetition, dictation and shadowing for Japanese and English. Vietnamese-first, multi-language ready.
**VI** Ứng dụng học từ vựng qua video transcript: transcript đồng bộ, bấm tra từ, lặp lại ngắt quãng, chép chính tả và shadowing cho tiếng Nhật và tiếng Anh. Ưu tiên tiếng Việt, sẵn sàng đa ngôn ngữ.

Stack: NestJS, MongoDB, Redis/BullMQ, Next.js, TypeScript, pnpm monorepo.

## Status / Trạng thái

Scaffold only: docs and Claude Code config. **No application code yet** - the developer sets up and builds it (see below).
Mới chỉ có khung: docs và cấu hình Claude Code. **Chưa có code ứng dụng** - developer tự setup và xây dựng.

## Start here / Bắt đầu

1. Read / Đọc: [docs/en/requirements.md](docs/en/requirements.md) | [docs/vi/requirements.md](docs/vi/requirements.md)
2. Follow / Làm theo: [docs/en/getting-started.md](docs/en/getting-started.md) | [docs/vi/getting-started.md](docs/vi/getting-started.md)
3. Plan / Kế hoạch: [docs/en/roadmap.md](docs/en/roadmap.md) | [docs/vi/roadmap.md](docs/vi/roadmap.md)

All docs: [docs/README.md](docs/README.md)

## Working with Claude Code / Làm việc với Claude Code

Claude Code acts as a **senior developer mentor**: it reviews, explains, checks and maintains docs. It does not run setup or write app code unless you explicitly ask. Rules live in [CLAUDE.md](CLAUDE.md).
Claude Code đóng vai **senior developer mentor**: review, giải thích, kiểm tra và duy trì docs. Nó không chạy setup hay viết code ứng dụng trừ khi bạn yêu cầu rõ.

| Command | Purpose / Mục đích |
|---|---|
| `/review [path\|branch]` | Code review / Review code |
| `/explain <code\|concept>` | Explain / Giải thích |
| `/check` | Lint + typecheck + test summary / Tóm tắt kết quả kiểm tra |
| `/docs-sync [doc]` | Sync EN to VI / Đồng bộ EN sang VI |
| `/adr <decision>` | New decision record / Tạo ADR |
