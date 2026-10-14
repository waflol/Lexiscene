# Thiết kế API (API Design) - Lexiscene

> Last updated: 2026-10-10 | Status: draft | English: [../en/api-design.md](../en/api-design.md)

## 1. Quy ước

| Chủ đề | Quy tắc |
|---|---|
| Base URL | `/api/v1` (versioning theo URI). Thay đổi gây vỡ -> `/api/v2` |
| Định dạng | JSON, UTF-8, trường `camelCase`, timestamp ISO 8601 UTC, id là chuỗi ObjectId |
| Auth | `Authorization: Bearer <accessToken>`. Refresh qua cookie httpOnly ở `POST /auth/refresh` |
| Locale | `Accept-Language` hoặc `?locale=vi`. Trường localize trả về đã resolve (dự phòng `nativeLocale -> en -> source`) |
| Phân trang | Cursor: `?limit=20&cursor=<opaque>` -> `{ "items": [], "nextCursor": "..." \| null }`. Tối đa limit 100 |
| Lỗi | `application/problem+json` (RFC 9457): `type`, `title`, `status`, `detail`, `code`, `errors[]` |
| Idempotency | Header `Idempotency-Key` cho `POST /billing/checkout-sessions` (và mọi POST thanh toán sau này) |
| Rate limit | `429` kèm `Retry-After`; chặt hơn cho `/auth/*`, `/dictionary/lookup-batch` |
| Tài liệu | OpenAPI tại `/api/docs` (sinh từ decorator NestJS; dùng để sinh client cho web) |
| Validation | zod schemas từ `packages/shared`; loại bỏ field lạ |
| Validation errors | `errors[]` gồm: `{ path, message }`. `path` là dot-notation từ zod issue path. `detail` (tùy chọn) do server kiểm soát, tiếng Anh |

Ví dụ lỗi:

```json
{
  "type": "https://lexiscene.app/problems/validation",
  "title": "Validation failed",
  "status": 422,
  "code": "VALIDATION_ERROR",
  "errors": [{ "path": "email", "message": "Invalid email" }]
}
```

Mã thường gặp: `UNAUTHENTICATED` 401, `FORBIDDEN` 403, `NOT_FOUND` 404, `VALIDATION_ERROR` 422, `ENTITLEMENT_REQUIRED` 402/403, `RATE_LIMITED` 429.

## 2. Endpoints

Quyền truy cập: **P** công khai, **U** user đã đăng nhập, **A** admin.

### Auth
| Method | Path | Access | Ghi chú |
|---|---|---|---|
| POST | `/auth/register` | P | email, mật khẩu, locale |
| POST | `/auth/login` | P | trả access token, set cookie refresh |
| POST | `/auth/refresh` | P | xoay vòng refresh token |
| POST | `/auth/logout` | U | thu hồi token family |
| POST | `/auth/verify-email` | P | token từ email |
| POST | `/auth/forgot-password` | P | luôn trả 202 (không lộ user tồn tại) |
| POST | `/auth/reset-password` | P | |
| GET | `/auth/google`, `/auth/google/callback` | P | OAuth |

### Users
| Method | Path | Access | Ghi chú |
|---|---|---|---|
| GET | `/users/me` | U | hồ sơ + snapshot entitlement |
| PATCH | `/users/me` | U | locale, ngôn ngữ đang học, mục tiêu hằng ngày |
| DELETE | `/users/me` | U | P1 |
| GET | `/users/me/export` | U | P1 |

### Video và transcript
| Method | Path | Access | Ghi chú |
|---|---|---|---|
| GET | `/videos` | P | lọc: `lang, level, topic, durationMax, q`; cursor pagination |
| GET | `/videos/:id` | P | metadata, tiêu đề đã localize |
| GET | `/videos/:id/transcript` | P* | segment + token + bản dịch theo locale đã resolve. *Transcript đầy đủ có thể yêu cầu đăng nhập (chốt ở Phase 2) |
| PUT | `/videos/:id/progress` | U | `{ positionMs }` |
| PUT/DELETE | `/videos/:id/favorite` | U | P1 |

### Từ điển
| Method | Path | Access | Ghi chú |
|---|---|---|---|
| GET | `/dictionary/entries/:id` | P | một entry, nghĩa đã localize; cache được |
| POST | `/dictionary/lookup-batch` | U | `{ ids: [] }` tối đa 50 |
| GET | `/dictionary/lookup` | U | `?lang&q` tra tự do (dịch đoạn bôi đen, P1) |

### Từ vựng và ôn tập
| Method | Path | Access | Ghi chú |
|---|---|---|---|
| GET | `/vocabulary` | U | lọc: `lang, deckId, q` |
| POST | `/vocabulary` | U | lưu từ kèm ngữ cảnh |
| PATCH/DELETE | `/vocabulary/:id` | U | ghi chú, tag, deck |
| GET | `/decks` / POST `/decks` | U | P1 cho deck tùy chỉnh |
| GET | `/reviews/due` | U | `?lang&limit` các thẻ kế tiếp |
| POST | `/reviews/:wordId/answer` | U | `{ grade: 1-4, elapsedMs }` |
| GET | `/reviews/stats` | U | P1 |

### Dictation
| Method | Path | Access | Ghi chú |
|---|---|---|---|
| POST | `/dictation/sessions` | U | `{ videoId, fromSid?, toSid?, mode }` |
| POST | `/dictation/sessions/:id/attempts` | U | `{ sid, text, durationMs, usedHints }` -> diff + điểm |
| POST | `/dictation/sessions/:id/finish` | U | tổng kết |
| GET | `/dictation/sessions` / `/:id` | U | lịch sử |

### Shadowing
| Method | Path | Access | Ghi chú |
|---|---|---|---|
| POST | `/shadowing/attempts` | U | `{ videoId, sid, mime }` -> `{ id, uploadUrl, expiresAt }` |
| POST | `/shadowing/attempts/:id/complete` | U | sau khi upload; đưa job chấm vào queue |
| GET | `/shadowing/attempts/:id` | U | trạng thái + kết quả |
| GET | `/shadowing/attempts` | U | liệt kê theo video |
| DELETE | `/shadowing/attempts/:id` | U | xóa cả audio |

### Thanh toán (Billing)
| Method | Path | Access | Ghi chú |
|---|---|---|---|
| GET | `/billing/plans` | P | giá đã localize |
| POST | `/billing/checkout-sessions` | U | `{ planCode, provider }` + `Idempotency-Key` -> `{ url }` |
| POST | `/billing/portal-sessions` | U | URL portal của nhà cung cấp |
| GET | `/billing/subscription` | U | trạng thái hiện tại + entitlement |
| POST | `/webhooks/stripe` | P (chữ ký) | raw body; idempotent |
| POST | `/webhooks/vnpay-ipn` | P (chữ ký) | P1 |

### Báo lỗi và admin
| Method | Path | Access | Ghi chú |
|---|---|---|---|
| POST | `/reports` | U | `{ target: { type, id }, reason, note }` |
| POST | `/admin/videos` | A | `{ sourceUrl, lang, license }` -> tạo video + chạy pipeline |
| GET | `/admin/pipeline/jobs` | A | lọc: status, video |
| POST | `/admin/pipeline/jobs/:id/retry` | A | |
| GET/PUT | `/admin/transcripts/:id` | A | sửa bản nháp (kiểm tra `revision` kiểu optimistic) |
| POST | `/admin/transcripts/:id/publish` | A | |
| POST | `/admin/transcripts/:id/translate` | A | `{ locale }` sinh bản dịch MT |
| GET | `/admin/reports`, PATCH `/admin/reports/:id` | A | P1 |

## 3. Ví dụ payload

### Transcript

```json
GET /api/v1/videos/66f0.../transcript?locale=vi
{
  "videoId": "66f0...",
  "lang": "ja",
  "revision": 7,
  "resolvedLocale": "vi",
  "segments": [
    {
      "sid": "s_7Hk2",
      "idx": 0,
      "startMs": 1200,
      "endMs": 4300,
      "text": "今日は天気がいいですね。",
      "translation": "Hôm nay thời tiết đẹp nhỉ.",
      "tokens": [
        { "surface": "今日", "lemma": "今日", "reading": "きょう", "pos": "noun", "entryId": "6a1...", "start": 0, "end": 2 },
        { "surface": "は", "lemma": "は", "reading": "は", "pos": "particle", "entryId": null, "start": 2, "end": 3 }
      ]
    }
  ]
}
```

`start`/`end` là offset ký tự trong `text` (đơn vị UTF-16 như chuỗi JS).

### Lượt dictation

```json
POST /api/v1/dictation/sessions/:id/attempts
{ "sid": "s_7Hk2", "text": "今日は天気が良いですね", "durationMs": 18000, "usedHints": 0 }

200
{
  "score": 0.92,
  "correct": false,
  "diff": [
    { "op": "equal", "text": "今日は天気が" },
    { "op": "replace", "expected": "いい", "actual": "良い", "acceptable": true },
    { "op": "equal", "text": "ですね" },
    { "op": "insert-missing", "expected": "。", "ignored": true }
  ],
  "expected": "今日は天気がいいですね。"
}
```

### Shadowing

```
1) POST /shadowing/attempts            { videoId, sid, mime: "audio/mp4" } -> { id, uploadUrl }
2) PUT  <uploadUrl>                    (browser upload blob trực tiếp)
3) POST /shadowing/attempts/:id/complete
4) GET  /shadowing/attempts/:id        -> { status: "scored", result: { similarity: 0.81, words: [...] } }
```

## 4. Quy tắc phân quyền

- Mọi route có guard/decorator tường minh; mặc định là từ chối.
- Tài nguyên thuộc user (từ vựng, attempt, bản ghi âm) luôn lọc theo `userId` lấy từ token, không bao giờ từ request body.
- Route admin yêu cầu vai trò `admin`; mọi thao tác ghi của admin tạo bản ghi audit.
- Tính năng bị giới hạn ném `ENTITLEMENT_REQUIRED` từ tầng service.

## 5. Real-time và tác vụ dài

- Trạng thái pipeline và điểm shadowing: polling ở v1 (`GET` kèm `status`); nâng lên SSE nếu cần.
- Webhook trả lời nhanh; việc nặng đưa vào queue.

## 6. Versioning và tương thích

- Thay đổi bổ sung (trường/endpoint tùy chọn mới) không phải thay đổi gây vỡ.
- CI so sánh OpenAPI sinh ra với nhánh main và fail nếu có thay đổi gây vỡ.
