# Requirements - Lexiscene

> Last updated: 2026-10-10 | Status: draft | Vietnamese: [../vi/requirements.md](../vi/requirements.md)

## 1. Vision and goals

Lexiscene helps people learn Japanese and English vocabulary **in context** by studying real videos: every line has a synced transcript, every word is tappable, and the learner practices with dictation and shadowing on the same material.

| ID | Goal |
|---|---|
| G1 | Learn words in context, not in isolation. |
| G2 | Close the loop: watch, look up, save, review, dictate, shadow. |
| G3 | Vietnamese-first UX; architecture ready for any UI/native language. |
| G4 | Sustainable: subscription revenue, mostly automated content pipeline. |

Non-goals for v1: live classes, social feed, native mobile apps (responsive web/PWA only), conversational AI tutor, user-uploaded videos of unknown copyright.

## 2. Users

| Persona | Description | Needs |
|---|---|---|
| Learner (primary) | Vietnamese speaker, English A1-B2 / Japanese JLPT N5-N2 | Understand real speech, build vocabulary, practice listening and speaking |
| Content editor / admin | Internal | Add videos, review and fix transcripts, publish |
| Future learner | Other native languages (ko, zh, es, ...) | Same product in their language |

## 3. Language model

| Term | Meaning | v1 values |
|---|---|---|
| `uiLocale` | Interface language | `vi`, `en` |
| `nativeLocale` | Language of glosses and translations shown to the learner | `vi` (fallback `en`) |
| `targetLang` | Language being learned | `ja`, `en` |
| content `lang` | Language spoken in a video/transcript (exactly one) | `ja`, `en` |

Adding a locale must not require schema changes (see [database-design](./database-design.md), "i18n pattern").

## 4. Functional requirements

Priority: **P0** = MVP, **P1** = right after MVP, **P2** = later.

### 4.1 Account (FR-AUTH)
| ID | Requirement | Pri |
|---|---|---|
| FR-AUTH-01 | Register/login with email + password | P0 |
| FR-AUTH-02 | Google OAuth login | P0 |
| FR-AUTH-03 | Email verification and password reset | P0 |
| FR-AUTH-04 | Profile: uiLocale, nativeLocale, target languages + level, daily goal | P0 |
| FR-AUTH-05 | Delete account and export my data | P1 |

### 4.2 Video and transcript (FR-VID)
| ID | Requirement | Pri |
|---|---|---|
| FR-VID-01 | Browse/search videos by language, level, topic, duration | P0 |
| FR-VID-02 | Video page with embedded player (YouTube IFrame API) | P0 |
| FR-VID-03 | Synced transcript: highlight current segment, click to seek, auto-scroll (can be toggled) | P0 |
| FR-VID-04 | Display modes: original / + translation / + reading (furigana for ja) / hidden | P0 |
| FR-VID-05 | Controls: speed 0.5-1.5x, loop segment, prev/next segment, keyboard shortcuts | P0 |
| FR-VID-06 | Watch progress and history | P1 |
| FR-VID-07 | Favorites and playlists | P1 |

### 4.3 Word lookup in transcript (FR-LOOK)
| ID | Requirement | Pri |
|---|---|---|
| FR-LOOK-01 | Tap/hover a word: popup with surface, reading, lemma, POS, meanings in nativeLocale (+ en), level (JLPT/CEFR), 1-2 examples | P0 |
| FR-LOOK-02 | Japanese: correct segmentation (no spaces), furigana for kanji, conjugated forms resolve to dictionary form | P0 |
| FR-LOOK-03 | English: inflected forms resolve to lemma; phrasal verbs/idioms as multi-word entries | P1 |
| FR-LOOK-04 | Popup actions: save word (with sentence + video + timestamp), play segment audio | P0 |
| FR-LOOK-05 | Select an arbitrary text span to translate | P1 |
| FR-LOOK-06 | Report a wrong token/meaning | P1 |
| FR-LOOK-07 | Kanji details (components, strokes) | P2 |

### 4.4 Vocabulary and SRS (FR-VOC)
| ID | Requirement | Pri |
|---|---|---|
| FR-VOC-01 | Saved words keep their context (sentence, video, timestamp) | P0 |
| FR-VOC-02 | Spaced repetition (FSRS) with 4 grades and daily limits | P0 |
| FR-VOC-03 | Card types: recognition (P0), recall and cloze-from-context (P1) | P0/P1 |
| FR-VOC-04 | Decks: one default per language (P0), custom decks (P1) | P0/P1 |
| FR-VOC-05 | Stats: due today, streak, retention | P1 |
| FR-VOC-06 | Import/export CSV and Anki | P2 |

### 4.5 Dictation - chep chinh ta (FR-DIC)
| ID | Requirement | Pri |
|---|---|---|
| FR-DIC-01 | Pick a video and range; play a segment; learner types what they hear | P0 |
| FR-DIC-02 | Replay, slow replay, hint (first letter / kana), skip | P0 |
| FR-DIC-03 | Checking with diff highlight. English: word-level with normalization (case, punctuation, apostrophes). Japanese: character-level, option to accept kana for kanji | P0 |
| FR-DIC-04 | Score per segment and session; list mistakes; one-click add missed words to vocabulary | P0 |
| FR-DIC-05 | Modes: sentence, whole video, keyword-only (cloze) | P1 |
| FR-DIC-06 | History and progress charts | P1 |

### 4.6 Shadowing (FR-SHAD)
| ID | Requirement | Pri |
|---|---|---|
| FR-SHAD-01 | Flow: listen to a segment, record (MediaRecorder), compare own audio with original | P0 |
| FR-SHAD-02 | Recordings private; learner can delete; automatic expiry | P0 |
| FR-SHAD-03 | Automatic feedback: ASR on recording vs transcript, similarity score, missed words | P1 |
| FR-SHAD-04 | Waveform overlay / timing comparison | P1 |
| FR-SHAD-05 | Japanese pitch accent, English intonation hints | P2 |

### 4.7 Payments (FR-PAY)
| ID | Requirement | Pri |
|---|---|---|
| FR-PAY-01 | Plans: Free, Pro monthly, Pro yearly | P0 |
| FR-PAY-02 | Checkout via Stripe | P0 |
| FR-PAY-03 | Entitlements granted only from verified provider webhooks | P0 |
| FR-PAY-04 | Manage subscription: cancel, resume, invoices (provider portal) | P0 |
| FR-PAY-05 | Feature gating by entitlement (limits on dictation/shadowing scoring, etc.) | P0 |
| FR-PAY-06 | Vietnam methods (VNPay / MoMo) | P1 |
| FR-PAY-07 | Trials and coupons | P1 |
| FR-PAY-08 | Refund/dispute handling by admin | P1 |

### 4.8 Admin and content (FR-ADM)
| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-01 | Role-based access (`user`, `admin`) | P0 |
| FR-ADM-02 | Add a video, run the pipeline, review the draft transcript | P0 |
| FR-ADM-03 | Transcript editor: text, timing, tokens, translations; publish/unpublish | P0 |
| FR-ADM-04 | Pipeline job monitor and retry | P1 |
| FR-ADM-05 | Reports queue (wrong meaning/token) | P1 |
| FR-ADM-06 | Dictionary management | P2 |

### 4.9 Internationalization (FR-I18N)
| ID | Requirement | Pri |
|---|---|---|
| FR-I18N-01 | All UI strings externalized; `vi` and `en` | P0 |
| FR-I18N-02 | Locale in URL (`/vi/...`, `/en/...`) | P0 |
| FR-I18N-03 | Content translations per locale; fallback `nativeLocale -> en -> source` | P0 |
| FR-I18N-04 | New locale = new message file + data translations, no code change | P1 |

## 5. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | API p95 < 300 ms (excluding pipeline); transcript page LCP < 2.5 s on 4G; lookup popup < 150 ms (cached) |
| Scalability | 10k MAU initially; stateless API; heavy work via queue; horizontal scaling |
| Availability | 99.5%; daily Mongo backups with point-in-time recovery |
| Security | OWASP ASVS L1: argon2id password hashing, short-lived JWT + rotating refresh token, rate limiting, CORS, security headers, input validation, webhook signature checks, admin audit log |
| Privacy | Minimal PII; audio recordings private with retention + delete; consent text; follow Vietnamese personal-data rules and GDPR-style basics (confirm with legal counsel before launch) |
| Accessibility | WCAG 2.1 AA; keyboard-first player and dictation |
| Compatibility | Latest 2 versions of Chrome, Edge, Firefox, Safari; mobile Safari/Chrome (MediaRecorder codecs differ: Safari mp4/aac, Chrome webm/opus) |
| Observability | Structured logs with request id, metrics, error tracking, pipeline job dashboard |
| Maintainability | TypeScript strict, tests for business logic, docs in sync (EN + VI) |
| Cost | Track ASR/translation cost per video minute; per-job budget cap |

## 6. Content and legal constraints

- **Do not download or re-host third-party videos.** Embed through official players only.
- Transcripts of third-party videos are published only when the license allows it (e.g. CC-BY), the owner gave permission, or the content is own/partner content. Each video stores `license` metadata and who verified it. This is the biggest product risk (see roadmap, "Risks").
- Dictionary data (e.g. JMdict/KANJIDIC: CC BY-SA; Tatoeba: CC BY) requires attribution; add an attributions page.
- Card data is handled only by Stripe/payment providers; never stored by us.
- Terms of Service, Privacy Policy and Refund Policy are required before public launch.

## 7. MVP acceptance (end of roadmap Phase 5)

1. A learner registers, sets `vi` as native language, picks a Japanese or English video.
2. The transcript scrolls in sync; tapping a word shows a correct popup within 150 ms (cached).
3. The learner saves the word with context and reviews it with SRS the next day.
4. The learner completes a dictation session and sees a diff and score.
5. All of the above works in `vi` and `en` UI.

## 8. Open questions

| # | Question | Needed by |
|---|---|---|
| Q1 | Free vs Pro limits (daily dictation count? saved words? shadowing scoring?) | Phase 8 |
| Q2 | Content sourcing strategy and licensing (own content, partners, CC) | Phase 2 |
| Q3 | ASR provider: self-hosted faster-whisper vs paid API (cost/quality) | Phase 6 |
| Q4 | Which Vietnamese payment provider first (VNPay vs MoMo vs bank transfer)? | Phase 8 |
| Q5 | Pronunciation scoring: is ASR-similarity enough for v1? | Phase 7 |
| Q6 | Mobile app or PWA only after launch? | Post-MVP |
