# Docs index / Mục lục tài liệu

English is the source of truth; Vietnamese mirrors it (same headings and order). / Tiếng Anh là nguồn sự thật; tiếng Việt phản chiếu cùng cấu trúc.

| Doc | EN | VI | Status |
|---|---|---|---|
| Requirements / Yêu cầu | [en](en/requirements.md) | [vi](vi/requirements.md) | draft |
| Architecture / Kiến trúc | [en](en/architecture.md) | [vi](vi/architecture.md) | draft |
| API design / Thiết kế API | [en](en/api-design.md) | [vi](vi/api-design.md) | draft |
| Database design / Thiết kế CSDL | [en](en/database-design.md) | [vi](vi/database-design.md) | draft |
| Transcription pipeline | [en](en/transcription-pipeline.md) | [vi](vi/transcription-pipeline.md) | draft |
| Roadmap / Lộ trình | [en](en/roadmap.md) | [vi](vi/roadmap.md) | draft |
| Getting started / Bắt đầu | [en](en/getting-started.md) | [vi](vi/getting-started.md) | draft |
| ADR 0001 Monorepo and stack | [en](en/adr/0001-monorepo-and-stack.md) | [vi](vi/adr/0001-monorepo-and-stack.md) | accepted |

## Conventions / Quy ước

- Header of every doc: `Last updated: YYYY-MM-DD | Status: draft|stable`.
- Edit EN first, then mirror to VI (`/docs-sync`). Keep code, endpoint paths, field names and technical terms in English in VI docs.
- Significant decisions go to `adr/` (`/adr`), numbered `NNNN-title.md`, in both languages.
- Diagrams use Mermaid (rendered by GitHub and most editors).
