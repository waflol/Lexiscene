# API Design - Lexiscene

> Last updated: 2026-10-14 | Status: draft | Vietnamese: [../vi/api-design.md](../vi/api-design.md)

## 1. Conventions

| Topic | Rule |
|---|---|
| Base URL | `/api/v1` (URI versioning). Breaking change -> `/api/v2` |
| Format | JSON, UTF-8, `camelCase` fields, ISO 8601 UTC timestamps, ids are ObjectId strings |
| Auth | `Authorization: Bearer <accessToken>`. Refresh via httpOnly cookie on `POST /auth/refresh` |
| Locale | `Accept-Language` or `?locale=vi`. Localized fields are returned already resolved (fallback `nativeLocale -> en -> source`) |
| Pagination | Cursor: `?limit=20&cursor=<opaque>` -> `{ "items": [], "nextCursor": "..." \| null }`. Max limit 100 |
| Errors | `application/problem+json` (RFC 9457): `type`, `title`, `status`, `detail`, `code`, `errors[]` |
| Idempotency | `Idempotency-Key` header on `POST /billing/checkout-sessions` (and any future payment POST) |
| Rate limit | `429` with `Retry-After`; stricter on `/auth/*`, `/dictionary/lookup-batch` |
| Docs | OpenAPI served at `/api/docs` (generated from NestJS decorators; used to generate the web client) |
| Validation | zod schemas from `packages/shared`; unknown fields rejected |
| Validation errors | `errors[]` items: `{ path, message }`. `path` is dot-notation from zod issue path. `detail` (optional) is server-controlled English |

Error example:

```json
{
  "type": "https://lexiscene.app/problems/validation",
  "title": "Validation failed",
  "status": 422,
  "code": "VALIDATION_ERROR",
  "errors": [{ "path": "email", "message": "Invalid email" }]
}
```

Common codes: `UNAUTHENTICATED` 401, `FORBIDDEN` 403, `NOT_FOUND` 404, `VALIDATION_ERROR` 422, `ENTITLEMENT_REQUIRED` 402/403, `RATE_LIMITED` 429.

## 2. Endpoints

Access: **P** public, **U** logged-in user, **A** admin.

### Auth
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/auth/register` | P | email, password, locales |
| POST | `/auth/login` | P | returns access token, sets refresh cookie |
| POST | `/auth/refresh` | P | rotates refresh token |
| POST | `/auth/logout` | U | revokes token family |
| POST | `/auth/verify-email` | P | token from email |
| POST | `/auth/forgot-password` | P | always 202 (no user enumeration) |
| POST | `/auth/reset-password` | P | |
| GET | `/auth/google`, `/auth/google/callback` | P | OAuth |

### Users
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/users/me` | U | profile + entitlement snapshot |
| PATCH | `/users/me` | U | locales, target languages, daily goal |
| DELETE | `/users/me` | U | P1 |
| GET | `/users/me/export` | U | P1 |

### Videos and transcripts
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/videos` | P | filters: `lang, level, topic, durationMax, q`; cursor pagination |
| GET | `/videos/:id` | P | metadata, localized title |
| GET | `/videos/:id/transcript` | P* | segments + tokens + translations for the resolved locale. *Full transcript may require login (decide in Phase 2) |
| PUT | `/videos/:id/progress` | U | `{ positionMs }` |
| PUT/DELETE | `/videos/:id/favorite` | U | P1 |

### Dictionary
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/dictionary/entries/:id` | P | one entry, localized glosses; cacheable |
| POST | `/dictionary/lookup-batch` | U | `{ ids: [] }` max 50 |
| GET | `/dictionary/lookup` | U | `?lang&q` free-text lookup (selection translate, P1) |

### Vocabulary and review
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/vocabulary` | U | filters: `lang, deckId, q` |
| POST | `/vocabulary` | U | save word with context |
| PATCH/DELETE | `/vocabulary/:id` | U | note, tags, deck |
| GET | `/decks` / POST `/decks` | U | P1 for custom decks |
| GET | `/reviews/due` | U | `?lang&limit` next cards |
| POST | `/reviews/:wordId/answer` | U | `{ grade: 1-4, elapsedMs }` |
| GET | `/reviews/stats` | U | P1 |

### Dictation
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/dictation/sessions` | U | `{ videoId, fromSid?, toSid?, mode }` |
| POST | `/dictation/sessions/:id/attempts` | U | `{ sid, text, durationMs, usedHints }` -> diff + score |
| POST | `/dictation/sessions/:id/finish` | U | summary |
| GET | `/dictation/sessions` / `/:id` | U | history |

### Shadowing
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/shadowing/attempts` | U | `{ videoId, sid, mime }` -> `{ id, uploadUrl, expiresAt }` |
| POST | `/shadowing/attempts/:id/complete` | U | after upload; enqueues scoring |
| GET | `/shadowing/attempts/:id` | U | status + result |
| GET | `/shadowing/attempts` | U | list by video |
| DELETE | `/shadowing/attempts/:id` | U | deletes audio too |

### Billing
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/billing/plans` | P | localized prices |
| POST | `/billing/checkout-sessions` | U | `{ planCode, provider }` + `Idempotency-Key` -> `{ url }` |
| POST | `/billing/portal-sessions` | U | provider portal URL |
| GET | `/billing/subscription` | U | current status + entitlements |
| POST | `/webhooks/stripe` | P (signature) | raw body; idempotent |
| POST | `/webhooks/vnpay-ipn` | P (signature) | P1 |

### Reports and admin
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/reports` | U | `{ target: { type, id }, reason, note }` |
| POST | `/admin/videos` | A | `{ sourceUrl, lang, license }` -> creates video + starts pipeline |
| GET | `/admin/pipeline/jobs` | A | filters: status, video |
| POST | `/admin/pipeline/jobs/:id/retry` | A | |
| GET/PUT | `/admin/transcripts/:id` | A | edit draft (optimistic `revision` check) |
| POST | `/admin/transcripts/:id/publish` | A | |
| POST | `/admin/transcripts/:id/translate` | A | `{ locale }` generate MT translation |
| GET | `/admin/reports`, PATCH `/admin/reports/:id` | A | P1 |

## 3. Payload examples

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

`start`/`end` are character offsets into `text` (UTF-16 code units, as in JS strings).

### Dictation attempt

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
2) PUT  <uploadUrl>                    (browser uploads blob directly)
3) POST /shadowing/attempts/:id/complete
4) GET  /shadowing/attempts/:id        -> { status: "scored", result: { similarity: 0.81, words: [...] } }
```

## 4. Authorization rules

- Every route has an explicit guard/decorator; default is deny.
- Resources owned by users (vocabulary, attempts, recordings) are always filtered by `userId` from the token, never from the request body.
- Admin routes require role `admin`; every admin mutation writes an audit record.
- Gated features throw `ENTITLEMENT_REQUIRED` from the service layer.

## 5. Real-time and long-running work

- Pipeline status and shadowing score: polling in v1 (`GET` with `status`); upgrade to SSE if needed.
- Webhooks answer quickly; heavy work is queued.

## 6. Versioning and compatibility

- Additive changes (new optional fields/endpoints) are not breaking.
- CI compares the generated OpenAPI against the main branch and fails on breaking changes.
