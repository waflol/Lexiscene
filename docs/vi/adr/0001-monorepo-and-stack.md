# ADR 0001: Monorepo và technology stack

> Date: 2026-10-10 | Status: accepted | English: [../../en/adr/0001-monorepo-and-stack.md](../../en/adr/0001-monorepo-and-stack.md)

## Bối cảnh

Lexiscene cần một web app, một REST API, một worker nền (pipeline transcript, chấm điểm) và logic dùng chung (schema, chuẩn hóa văn bản dùng cho pipeline, dictation và shadowing). Một developer, thiên về học tập, ưu tiên TypeScript.

## Quyết định

- **Monorepo pnpm workspaces**: `apps/api`, `apps/worker`, `apps/web`, `packages/shared`.
- **NestJS** cho API và worker (module hóa, DI, tốt để học kiến trúc backend).
- **MongoDB + Mongoose** (replica set) cho nội dung dạng document linh hoạt (transcript, map localize).
- **Redis + BullMQ** cho queue, cache, rate limiting.
- **Next.js (App Router) + next-intl** cho web app.
- **zod schema trong `packages/shared`** là nguồn duy nhất cho validation và type; OpenAPI sinh từ API để tạo client cho web.
- Docs bằng tiếng Anh và tiếng Việt (EN là nguồn sự thật); các file cho công cụ AI viết bằng tiếng Anh.

## Các phương án đã cân nhắc

| Phương án | Vì sao (tạm thời) không chọn |
|---|---|
| Repo riêng cho mỗi app | Chia sẻ code và thay đổi nguyên tử khó hơn |
| PostgreSQL | Lựa chọn tốt, nhưng document transcript/i18n hợp với Mongo và Mongo là stack dự án đã chọn |
| Chỉ Express/Fastify | Ít cấu trúc; NestJS dạy các mẫu kiến trúc có thể mở rộng |
| Turborepo/Nx từ ngày đầu | Thêm công cụ trước khi cần; có thể thêm sau nếu build chậm |

## Hệ quả

- Một đồ thị phụ thuộc duy nhất; type dùng chung ngăn API/web lệch nhau.
- Transaction của Mongo cần replica set kể cả ở local.
- Segment embed trong transcript cần giới hạn số segment và `sid` ổn định.
- Phải giữ docs EN và VI đồng bộ (`/docs-sync`).
