# Bắt đầu (checklist setup thủ công) - Lexiscene

> Last updated: 2026-10-10 | Status: draft | English: [../en/getting-started.md](../en/getting-started.md)

Claude Code chỉ tạo docs và cấu hình `.claude/`. **Bạn** tự setup codebase bằng tay để học. Các lệnh dưới đây chỉ để tham khảo; hãy đọc tài liệu chính thức của từng công cụ và điều chỉnh theo phiên bản.

## 0. Điều kiện tiên quyết

- [ ] Git, Node.js LTS (qua fnm hoặc nvm), pnpm (`corepack enable`)
- [ ] Docker Desktop (hoặc Docker Engine + Compose)
- [ ] VS Code (hoặc editor khác) với ESLint, Prettier, MongoDB extension
- [ ] Đã cài Claude Code; mở nó ở thư mục gốc repo để đọc `CLAUDE.md`

## 1. Repository

- [ ] `git init` và commit đầu tiên với phần scaffold (docs + `.claude/` + `CLAUDE.md`)
- [ ] Tạo repo remote và push; bảo vệ `main`; làm việc trên các nhánh

## 2. Khung monorepo

- [ ] `package.json` gốc (private), `pnpm-workspace.yaml` với `apps/*` và `packages/*`
- [ ] `tsconfig.base.json` với `strict: true`
- [ ] Chọn task runner (script pnpm thuần trước; Turborepo/Nx chỉ khi cần cache)

## 3. API (apps/api)

- [ ] Sinh bằng Nest CLI chính thức trong `apps/` (tên `api`), xóa `.git` lồng nếu bị tạo
- [ ] Thêm config module với env validate bằng zod (fail fast)
- [ ] Thêm kết nối Mongoose; thêm Swagger/OpenAPI; thêm `GET /health` và `/health/ready`
- [ ] Global validation pipe + exception filter problem+json (xem [api-design](./api-design.md))

## 4. Web (apps/web)

- [ ] Tạo bằng `create-next-app` (TypeScript, App Router, Tailwind, ESLint) trong `apps/`
- [ ] Thêm `next-intl` với `app/[locale]` và `messages/vi.json`, `messages/en.json`
- [ ] Thêm một trang gọi endpoint health của API

## 5. Package dùng chung (packages/shared)

- [ ] Package TypeScript, build hoặc dùng qua workspace path
- [ ] Thêm zod schema đầu tiên + một text util (vd. `normalizeText`) kèm test

## 6. Hạ tầng local

- [ ] `docker-compose.yml`: MongoDB dạng **replica set một node** (cần cho transaction) và Redis
- [ ] Commit `.env.example`; `.env` thật bị git bỏ qua
- [ ] Kiểm tra API kết nối được cả hai

## 7. Cổng chất lượng

- [ ] Cấu hình ESLint + Prettier dùng chung; script gốc `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`
- [ ] Husky + lint-staged + commitlint (Conventional Commits)
- [ ] GitHub Actions: install, lint, typecheck, test trên PR

## 8. Kết nối Claude Code

- [ ] Điền mục **Commands** trong `CLAUDE.md` bằng các script thật của bạn
- [ ] Thử `/check`, rồi `/review` trên PR đầu tiên
- [ ] Chỉnh danh sách allow/deny trong `.claude/settings.json` cho khớp công cụ của bạn

## Xong khi

- `pnpm dev` khởi động API, web (và worker sau này) cùng lúc
- `GET /health/ready` xanh với Mongo và Redis
- Web hiển thị được ở `vi` và `en` và cho thấy trạng thái health của API
- CI xanh trên một pull request
- ADR đầu tiên ([0001](./adr/0001-monorepo-and-stack.md)) khớp với những gì bạn xây, hoặc bạn đã viết ADR mới cho phần khác biệt

## Mẹo làm việc với Claude Code như một mentor

- Hỏi "tại sao" và "đánh đổi là gì", đừng chỉ hỏi "làm thế nào".
- Dán lỗi kèm lệnh bạn đã chạy; yêu cầu giải thích nguyên nhân gốc trước khi sửa.
- Chỉ xin code khi bạn muốn: nói rõ "write it for me".
- Sau mỗi phase trong [roadmap](./roadmap.md), nhờ review cả module so với docs.
