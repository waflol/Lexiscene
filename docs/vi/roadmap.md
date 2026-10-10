# Lộ trình phát triển (Development Roadmap) - Lexiscene

> Last updated: 2026-10-10 | Status: draft | English: [../en/roadmap.md](../en/roadmap.md)

Giả định: một developer vừa học vừa làm, ~10-15 giờ/tuần. Thời lượng chỉ là ước lượng thô và sẽ rút ngắn khi kỹ năng tăng. Developer tự viết code; Claude Code review, giải thích, kiểm tra và giữ docs đồng bộ.

## Quy ước làm việc (mỗi task)

1. Mỗi task một nhánh nhỏ, commit theo Conventional Commits.
2. Tự viết code và test; hỏi Claude Code `/explain` khi bí.
3. Trước khi tạo PR: `/check`, sau đó `/review`; sửa blocker và major.
4. Cập nhật `docs/en` (rồi `/docs-sync`) khi hành vi hoặc thiết kế thay đổi. Quyết định mới -> `/adr`.

## Các phase

| Phase | Tuần | Trọng tâm |
|---|---|---|
| 0 | 1-2 | Nền tảng và công cụ |
| 1 | 2 | Auth và hồ sơ |
| 2 | 3 | Video và player transcript (dữ liệu seed) |
| 3 | 2-3 | Từ điển và tra từ |
| 4 | 2-3 | Từ vựng và SRS |
| 5 | 2 | Dictation (**hoàn thành MVP**) |
| 6 | 4 | Pipeline v1 và trình sửa admin |
| 7 | 3 | Shadowing |
| 8 | 3 | Thanh toán và entitlement |
| 9 | 3 | Hoàn thiện và beta |
| 10+ | - | Thêm locale, pitch accent, PWA/mobile, nhập Anki |

### Phase 0 - Nền tảng (xem [getting-started](./getting-started.md))
- Giao: monorepo pnpm, app NestJS và Next.js, `packages/shared`, Docker Compose (Mongo replica set + Redis), validate env, lint/format/commit hook, CI, endpoint health, khung i18n (`vi`/`en`).
- Học: công cụ monorepo, module/DI của NestJS, kết nối Mongoose, Next.js App Router, GitHub Actions.
- Xong khi: `pnpm dev` chạy được mọi thứ; CI xanh; `/health/ready` kiểm tra Mongo + Redis; web hiển thị một trang đã dịch.

### Phase 1 - Auth và hồ sơ
- Giao: register/login/refresh/logout, Google OAuth, xác minh email và đặt lại mật khẩu, hồ sơ với locale và ngôn ngữ đang học, guard, rate limiting.
- Học: JWT so với session, xoay vòng refresh, băm mật khẩu, guard của NestJS, cookie httpOnly, CORS.
- Xong khi: FR-AUTH-01..04 đạt; phát hiện được tái sử dụng refresh token; test phủ các luồng auth.

### Phase 2 - Video và player transcript
- Giao: schema `videos` và `transcripts`, **script seed với transcript viết tay** (giảm rủi ro UX trước khi có pipeline), trang danh sách/chi tiết, YouTube IFrame player, transcript đồng bộ (highlight, tua, tự cuộn), chế độ hiển thị, lặp và tốc độ, phím tắt.
- Học: sự kiện IFrame Player API và độ trôi thời gian, Zustand, TanStack Query, Server vs Client Components, render ruby/furigana.
- Xong khi: FR-VID-01..05 đạt; độ lệch đồng bộ trong ~200 ms; endpoint transcript được cache bằng ETag.

### Phase 3 - Từ điển và tra từ
- Giao: script import từ điển ja và en (kèm metadata license), index cho `dictionary_entries`, popup tra từ, cache Redis, trang attributions, token trong transcript seed được liên kết với entry.
- Học: script ETL, text index, chiến lược caching, cấu trúc JMdict, chuẩn hóa từ loại.
- Xong khi: FR-LOOK-01,02,04 đạt; popup < 150 ms khi đã cache; phủ 95% từ nội dung trên video seed.

### Phase 4 - Từ vựng và SRS
- Giao: lưu kèm ngữ cảnh, deck mặc định, bộ lập lịch FSRS, UI ôn tập (thẻ nhận biết), review log, giới hạn hằng ngày.
- Học: thuật toán lặp lại ngắt quãng, index hàng đợi đến hạn, optimistic UI, múi giờ cho khái niệm "hôm nay".
- Xong khi: FR-VOC-01..04 đạt; scheduler được unit test với các vector đã biết.

### Phase 5 - Dictation (hoàn thành MVP)
- Giao: text utils dùng chung (`normalize`, `diff`, `toKana`) kèm fixture, API session/attempt, UI dictation với gợi ý, hiển thị diff, chấm điểm, thêm từ sai vào từ vựng.
- Học: chuẩn hóa Unicode, thuật toán diff, quy tắc so sánh ja vs en, UX ưu tiên bàn phím, xử lý nhập liệu IME.
- Xong khi: FR-DIC-01..04 đạt; tiêu chí chấp nhận MVP ở mục 7 của requirements đạt end-to-end.

### Phase 6 - Pipeline v1 và trình sửa admin
- Giao: app worker, queue BullMQ, source adapter (`upload` trước), ASR adapter, chia segment, tokenizer, liên kết từ điển, dịch MT, auto-QA, trình sửa transcript cho admin, màn theo dõi job.
- Học: queue và idempotency, retry/backoff, object storage, xử lý đầu ra ASR, kiểm soát chi phí.
- Xong khi: audio upload biến thành transcript có thể duyệt; chạy lại là idempotent; cờ QA hiển thị trong trình sửa.

### Phase 7 - Shadowing
- Giao: ghi âm bằng MediaRecorder (xử lý codec Safari/Chrome), presigned upload, job chấm điểm, UI so sánh, lưu giữ và xóa.
- Học: API media của trình duyệt, presigned URL, UX cho job bất đồng bộ, privacy by design.
- Xong khi: FR-SHAD-01,02,03 đạt trên trình duyệt desktop và mobile.

### Phase 8 - Thanh toán và entitlement
- Giao: gói, Stripe checkout và portal, webhook đã xác minh, xử lý idempotent, `EntitlementsService`, giới hạn tính năng, UI billing. VNPay/MoMo cùng interface nếu đã quyết định.
- Học: bảo mật webhook, idempotency key, transaction, vòng đời subscription, test mode và CLI.
- Xong khi: FR-PAY-01..05 đạt; webhook phát lại vô hại; quyền truy cập không bao giờ được cấp từ khẳng định của client.

### Phase 9 - Hoàn thiện và beta
- Giao: rà soát bảo mật (checklist OWASP), load test, kiểm tra khả năng tiếp cận, backup + diễn tập khôi phục, giám sát/cảnh báo, trang pháp lý, analytics, SEO, triển khai (ADR), nhóm beta.
- Xong khi: bảng NFR trong requirements đạt hoặc các ngoại lệ được ghi lại.

## Cột mốc

| Cột mốc | Sau | Ý nghĩa |
|---|---|---|
| M1 Walking skeleton | Phase 0 | Mọi thứ chạy và deploy được ở local |
| M2 Xem được | Phase 2 | Video seed + transcript đồng bộ |
| M3 MVP | Phase 5 | Vòng học đầy đủ cho người dùng thử sớm |
| M4 Động cơ nội dung | Phase 6 | Video mới không cần JSON thủ công |
| M5 Beta | Phase 9 | Có người dùng trả phí |

## Rủi ro (Risks)

| Rủi ro | Tác động | Giảm thiểu |
|---|---|---|
| Bản quyền nội dung | Pháp lý/gỡ nội dung | Trường license + cổng xác minh; nội dung riêng/đối tác/CC; chỉ phát qua embed |
| Chất lượng tokenize tiếng Nhật | Popup sai | Interface tokenizer, admin sửa token, danh sách candidates |
| Chi phí/chất lượng ASR | Ngân sách, transcript tệ | Provider adapter, trần chi phí, duyệt thủ công, bắt đầu với danh mục nhỏ |
| Khác biệt audio giữa trình duyệt | Lỗi shadowing | Test đa trình duyệt sớm ở Phase 7, đàm phán codec |
| Phình phạm vi | Không bao giờ ra mắt | MVP ở Phase 5; P1/P2 chỉ sau M3 |
| Sai sót thanh toán | Tiền/niềm tin | Entitlement chỉ từ webhook, idempotency, test mode, tập trung khi review code |
| Quỹ thời gian của một developer | Trễ tiến độ | Giữ phase nhỏ; cắt hạng mục P1 trước |
