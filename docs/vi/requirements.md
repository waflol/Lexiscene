# Yêu cầu (Requirements) - Lexiscene

> Last updated: 2026-10-10 | Status: draft | English: [../en/requirements.md](../en/requirements.md)

## 1. Tầm nhìn và mục tiêu

Lexiscene giúp người học tiếng Nhật và tiếng Anh học từ vựng **theo ngữ cảnh** thông qua video thật: mỗi câu có transcript đồng bộ, mỗi từ đều bấm tra được, và người học luyện chép chính tả (dictation) và shadowing ngay trên cùng nội dung.

| ID | Mục tiêu |
|---|---|
| G1 | Học từ trong ngữ cảnh, không học rời rạc. |
| G2 | Khép kín vòng học: xem, tra, lưu, ôn, chép chính tả, shadowing. |
| G3 | Trải nghiệm ưu tiên tiếng Việt; kiến trúc sẵn sàng cho bất kỳ ngôn ngữ giao diện/mẹ đẻ nào. |
| G4 | Bền vững: doanh thu từ subscription, pipeline nội dung chủ yếu tự động. |

Ngoài phạm vi v1: lớp học trực tiếp, mạng xã hội, app mobile native (chỉ web responsive/PWA), gia sư AI hội thoại, video người dùng tự upload không rõ bản quyền.

## 2. Người dùng

| Persona | Mô tả | Nhu cầu |
|---|---|---|
| Người học (chính) | Người Việt, tiếng Anh A1-B2 / tiếng Nhật JLPT N5-N2 | Hiểu lời nói thật, xây vốn từ, luyện nghe và nói |
| Biên tập nội dung / admin | Nội bộ | Thêm video, duyệt và sửa transcript, xuất bản |
| Người học tương lai | Ngôn ngữ mẹ đẻ khác (ko, zh, es, ...) | Cùng sản phẩm bằng ngôn ngữ của họ |

## 3. Mô hình ngôn ngữ

| Thuật ngữ | Ý nghĩa | Giá trị v1 |
|---|---|---|
| `uiLocale` | Ngôn ngữ giao diện | `vi`, `en` |
| `nativeLocale` | Ngôn ngữ của nghĩa và bản dịch hiển thị cho người học | `vi` (dự phòng `en`) |
| `targetLang` | Ngôn ngữ đang học | `ja`, `en` |
| content `lang` | Ngôn ngữ được nói trong video/transcript (đúng một) | `ja`, `en` |

Thêm một locale mới không được yêu cầu thay đổi schema (xem [database-design](./database-design.md), mục "i18n pattern").

## 4. Yêu cầu chức năng

Ưu tiên: **P0** = MVP, **P1** = ngay sau MVP, **P2** = sau này.

### 4.1 Tài khoản (FR-AUTH)
| ID | Yêu cầu | Pri |
|---|---|---|
| FR-AUTH-01 | Đăng ký/đăng nhập bằng email + mật khẩu | P0 |
| FR-AUTH-02 | Đăng nhập Google OAuth | P0 |
| FR-AUTH-03 | Xác minh email và đặt lại mật khẩu | P0 |
| FR-AUTH-04 | Hồ sơ: uiLocale, nativeLocale, ngôn ngữ đang học + trình độ, mục tiêu hằng ngày | P0 |
| FR-AUTH-05 | Xóa tài khoản và xuất dữ liệu của tôi | P1 |

### 4.2 Video và transcript (FR-VID)
| ID | Yêu cầu | Pri |
|---|---|---|
| FR-VID-01 | Duyệt/tìm video theo ngôn ngữ, trình độ, chủ đề, thời lượng | P0 |
| FR-VID-02 | Trang video với player nhúng (YouTube IFrame API) | P0 |
| FR-VID-03 | Transcript đồng bộ: highlight câu hiện tại, bấm để tua, tự cuộn (có thể tắt) | P0 |
| FR-VID-04 | Chế độ hiển thị: bản gốc / + bản dịch / + cách đọc (furigana cho ja) / ẩn | P0 |
| FR-VID-05 | Điều khiển: tốc độ 0.5-1.5x, lặp câu, câu trước/sau, phím tắt | P0 |
| FR-VID-06 | Tiến độ xem và lịch sử | P1 |
| FR-VID-07 | Yêu thích và playlist | P1 |

### 4.3 Tra từ trong transcript (FR-LOOK)
| ID | Yêu cầu | Pri |
|---|---|---|
| FR-LOOK-01 | Bấm/rê vào từ: popup gồm surface, cách đọc, lemma, từ loại, nghĩa theo nativeLocale (+ en), cấp độ (JLPT/CEFR), 1-2 ví dụ | P0 |
| FR-LOOK-02 | Tiếng Nhật: tách từ đúng (không có khoảng trắng), furigana cho kanji, dạng chia đưa về dạng từ điển | P0 |
| FR-LOOK-03 | Tiếng Anh: dạng biến đổi đưa về lemma; cụm động từ/thành ngữ là mục nhiều từ | P1 |
| FR-LOOK-04 | Hành động trong popup: lưu từ (kèm câu + video + mốc thời gian), phát audio câu | P0 |
| FR-LOOK-05 | Bôi đen đoạn văn bất kỳ để dịch | P1 |
| FR-LOOK-06 | Báo lỗi token/nghĩa sai | P1 |
| FR-LOOK-07 | Chi tiết kanji (bộ phận, nét) | P2 |

### 4.4 Từ vựng và SRS (FR-VOC)
| ID | Yêu cầu | Pri |
|---|---|---|
| FR-VOC-01 | Từ đã lưu giữ nguyên ngữ cảnh (câu, video, mốc thời gian) | P0 |
| FR-VOC-02 | Lặp lại ngắt quãng (FSRS) với 4 mức đánh giá và giới hạn hằng ngày | P0 |
| FR-VOC-03 | Loại thẻ: nhận biết (P0), nhớ lại và cloze từ ngữ cảnh (P1) | P0/P1 |
| FR-VOC-04 | Bộ thẻ (deck): một mặc định cho mỗi ngôn ngữ (P0), deck tùy chỉnh (P1) | P0/P1 |
| FR-VOC-05 | Thống kê: thẻ đến hạn hôm nay, streak, tỉ lệ nhớ | P1 |
| FR-VOC-06 | Nhập/xuất CSV và Anki | P2 |

### 4.5 Chép chính tả - Dictation (FR-DIC)
| ID | Yêu cầu | Pri |
|---|---|---|
| FR-DIC-01 | Chọn video và đoạn; phát một câu; người học gõ lại điều nghe được | P0 |
| FR-DIC-02 | Nghe lại, nghe chậm, gợi ý (chữ cái đầu / kana), bỏ qua | P0 |
| FR-DIC-03 | Chấm bằng diff có highlight. Tiếng Anh: theo từ, có chuẩn hóa (hoa/thường, dấu câu, dấu nháy). Tiếng Nhật: theo ký tự, tùy chọn chấp nhận kana thay kanji | P0 |
| FR-DIC-04 | Điểm theo câu và theo phiên; liệt kê lỗi; thêm từ sai vào từ vựng bằng một cú bấm | P0 |
| FR-DIC-05 | Chế độ: theo câu, cả video, chỉ từ khóa (cloze) | P1 |
| FR-DIC-06 | Lịch sử và biểu đồ tiến bộ | P1 |

### 4.6 Shadowing (FR-SHAD)
| ID | Yêu cầu | Pri |
|---|---|---|
| FR-SHAD-01 | Luồng: nghe một câu, ghi âm (MediaRecorder), so sánh giọng mình với bản gốc | P0 |
| FR-SHAD-02 | Bản ghi âm riêng tư; người học xóa được; tự hết hạn | P0 |
| FR-SHAD-03 | Phản hồi tự động: ASR bản ghi so với transcript, điểm tương đồng, từ bị sót | P1 |
| FR-SHAD-04 | Chồng waveform / so sánh thời gian | P1 |
| FR-SHAD-05 | Pitch accent tiếng Nhật, gợi ý ngữ điệu tiếng Anh | P2 |

### 4.7 Thanh toán (FR-PAY)
| ID | Yêu cầu | Pri |
|---|---|---|
| FR-PAY-01 | Gói: Free, Pro tháng, Pro năm | P0 |
| FR-PAY-02 | Thanh toán qua Stripe | P0 |
| FR-PAY-03 | Quyền lợi (entitlement) chỉ cấp từ webhook đã xác minh của nhà cung cấp | P0 |
| FR-PAY-04 | Quản lý subscription: hủy, tiếp tục, hóa đơn (portal của nhà cung cấp) | P0 |
| FR-PAY-05 | Giới hạn tính năng theo entitlement (số lần dictation, chấm shadowing, ...) | P0 |
| FR-PAY-06 | Phương thức tại Việt Nam (VNPay / MoMo) | P1 |
| FR-PAY-07 | Dùng thử và coupon | P1 |
| FR-PAY-08 | Admin xử lý hoàn tiền/tranh chấp | P1 |

### 4.8 Admin và nội dung (FR-ADM)
| ID | Yêu cầu | Pri |
|---|---|---|
| FR-ADM-01 | Phân quyền theo vai trò (`user`, `admin`) | P0 |
| FR-ADM-02 | Thêm video, chạy pipeline, duyệt transcript nháp | P0 |
| FR-ADM-03 | Trình sửa transcript: văn bản, thời gian, token, bản dịch; xuất bản/gỡ | P0 |
| FR-ADM-04 | Theo dõi job pipeline và chạy lại | P1 |
| FR-ADM-05 | Hàng đợi báo lỗi (nghĩa/token sai) | P1 |
| FR-ADM-06 | Quản lý từ điển | P2 |

### 4.9 Đa ngôn ngữ (FR-I18N)
| ID | Yêu cầu | Pri |
|---|---|---|
| FR-I18N-01 | Mọi chuỗi UI tách riêng; `vi` và `en` | P0 |
| FR-I18N-02 | Locale trong URL (`/vi/...`, `/en/...`) | P0 |
| FR-I18N-03 | Bản dịch nội dung theo locale; dự phòng `nativeLocale -> en -> source` | P0 |
| FR-I18N-04 | Locale mới = thêm file message + bản dịch dữ liệu, không đổi code | P1 |

## 5. Yêu cầu phi chức năng

| Mảng | Yêu cầu |
|---|---|
| Hiệu năng | API p95 < 300 ms (không tính pipeline); LCP trang transcript < 2.5 s trên 4G; popup tra từ < 150 ms (đã cache) |
| Khả năng mở rộng | 10k MAU ban đầu; API stateless; việc nặng qua queue; scale ngang |
| Tính sẵn sàng | 99.5%; backup Mongo hằng ngày kèm point-in-time recovery |
| Bảo mật | OWASP ASVS L1: băm mật khẩu argon2id, JWT ngắn hạn + refresh token xoay vòng, rate limiting, CORS, security headers, validate input, kiểm tra chữ ký webhook, audit log cho admin |
| Quyền riêng tư | Tối thiểu hóa PII; bản ghi âm riêng tư có thời hạn lưu + xóa được; văn bản đồng ý; tuân thủ quy định bảo vệ dữ liệu cá nhân của Việt Nam và nguyên tắc cơ bản kiểu GDPR (xác nhận với tư vấn pháp lý trước khi ra mắt) |
| Khả năng tiếp cận | WCAG 2.1 AA; player và dictation dùng được hoàn toàn bằng bàn phím |
| Tương thích | 2 phiên bản mới nhất của Chrome, Edge, Firefox, Safari; mobile Safari/Chrome (codec MediaRecorder khác nhau: Safari mp4/aac, Chrome webm/opus) |
| Quan sát | Log có cấu trúc kèm request id, metrics, theo dõi lỗi, dashboard job pipeline |
| Bảo trì | TypeScript strict, test cho business logic, docs đồng bộ (EN + VI) |
| Chi phí | Theo dõi chi phí ASR/dịch theo phút video; trần ngân sách mỗi job |

## 6. Ràng buộc về nội dung và pháp lý

- **Không tải về hoặc tự lưu trữ lại video của bên thứ ba.** Chỉ nhúng qua player chính thức.
- Transcript của video bên thứ ba chỉ được xuất bản khi giấy phép cho phép (vd. CC-BY), chủ sở hữu đồng ý, hoặc là nội dung của mình/đối tác. Mỗi video lưu metadata `license` và người xác minh. Đây là rủi ro sản phẩm lớn nhất (xem roadmap, mục "Risks").
- Dữ liệu từ điển (vd. JMdict/KANJIDIC: CC BY-SA; Tatoeba: CC BY) yêu cầu ghi nguồn; cần trang attributions.
- Dữ liệu thẻ chỉ do Stripe/nhà cung cấp thanh toán xử lý; chúng ta không lưu.
- Cần Điều khoản dịch vụ, Chính sách quyền riêng tư và Chính sách hoàn tiền trước khi ra mắt công khai.

## 7. Tiêu chí chấp nhận MVP (cuối Phase 5 của roadmap)

1. Người học đăng ký, đặt `vi` làm ngôn ngữ mẹ đẻ, chọn một video tiếng Nhật hoặc tiếng Anh.
2. Transcript cuộn đồng bộ; bấm vào từ hiện popup đúng trong 150 ms (đã cache).
3. Người học lưu từ kèm ngữ cảnh và ôn bằng SRS vào ngày hôm sau.
4. Người học hoàn thành một phiên dictation và xem được diff cùng điểm.
5. Tất cả hoạt động ở giao diện `vi` và `en`.

## 8. Câu hỏi mở

| # | Câu hỏi | Cần chốt trước |
|---|---|---|
| Q1 | Giới hạn Free vs Pro (số lần dictation/ngày? số từ lưu? chấm shadowing?) | Phase 8 |
| Q2 | Chiến lược nguồn nội dung và bản quyền (nội dung riêng, đối tác, CC) | Phase 2 |
| Q3 | ASR: tự host faster-whisper hay dùng API trả phí (chi phí/chất lượng) | Phase 6 |
| Q4 | Cổng thanh toán Việt Nam nào trước (VNPay, MoMo hay chuyển khoản)? | Phase 8 |
| Q5 | Chấm phát âm: độ tương đồng từ ASR đã đủ cho v1 chưa? | Phase 7 |
| Q6 | Sau khi ra mắt: làm app mobile hay chỉ PWA? | Sau MVP |
