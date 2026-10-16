# TasteBridge: Kiến trúc kinh doanh

> 🇬🇧 English: [BUSINESS_ARCHITECTURE.md](BUSINESS_ARCHITECTURE.md)

**Định vị:** *Quyết định bằng bằng chứng, rồi thực thi việc gia nhập.* TasteBridge là chuyên viên phân tích gia nhập thị trường bằng AI kiêm Market-Entry OS, giúp **thương hiệu tiêu dùng nước ngoài vào Việt Nam** (trọng tâm) và sau này **thương hiệu Việt ra nước ngoài**, dựa trên đồ thị gu văn hóa của Qloo.

**Hiện trạng sản phẩm (v0.2.0).** Phân tích và kết luận đã chạy thật trên ứng dụng Base44: 11 agent trên bằng chứng Qloo, GO / PILOT / NO-GO, chỉ số cơ hội, bản đồ nhiệt theo quận, gợi ý đối tác và bản ghi nhớ cho TP.HCM, Hà Nội, Đà Nẵng. Market-Entry OS bên dưới **đang triển khai**; marketplace và giá **mới là kế hoạch**. Tài liệu này không khẳng định khách hàng, doanh thu hay kết quả nào chưa có.

**Tương thích tiêu chuẩn.** Thiết kế *tham chiếu*, không được chứng nhận theo các khung dưới đây.

| Khung | Điều chúng tôi áp dụng |
|---|---|
| ISO 56001 / 56002 (quản lý đổi mới) | Gia nhập theo giai đoạn, rà soát danh mục, học từ kết quả |
| ISO 9001 (quản lý chất lượng) | Quy trình cốt lõi có tài liệu, người phụ trách, KPI, vòng khắc phục |
| ISO 31000 (quản lý rủi ro) | Sổ rủi ro: khả năng, tác động, xử lý, người phụ trách |
| ISO/IEC 27001 + 27701 (bảo mật và quyền riêng tư) | Bí mật chỉ ở máy chủ, đặc quyền tối thiểu, tối thiểu hóa dữ liệu |
| ISO 37301 (quản lý tuân thủ) | Sổ nghĩa vụ tuân thủ (đăng ký kinh doanh, nhượng quyền, an toàn thực phẩm, ghi nhãn, bảo vệ dữ liệu) |
| Luật Bảo vệ dữ liệu cá nhân Việt Nam | Đồng ý, giới hạn mục đích, quyền chủ thể dữ liệu, đánh giá chuyển dữ liệu ra nước ngoài |

---

## 1. Chuỗi giá trị

```
Discover ──▶ Validate ──▶ Setup ──▶ Launch ──▶ Scale
```

| Giai đoạn | Câu hỏi của khách hàng | Năng lực TasteBridge | Trạng thái |
|---|---|---|---|
| **Discover** | "Có hợp gu ở đây không, và ở đâu?" | Phân tích 11 agent trên bằng chứng Qloo; kết luận, độ tin cậy, chỉ số cơ hội, phân khúc, đối thủ, rủi ro, bản đồ nhiệt, bản ghi nhớ | **Đang chạy** |
| **Validate** | "Người thật có muốn trước khi ta cam kết?" | Thiết kế pilot từ kết luận, thử nghiệm nhu cầu | Đang triển khai |
| **Setup** | "Cần gì để được phép và đủ điều kiện mở cửa?" | Theo dõi hồ sơ pháp lý, pipeline đối tác, danh sách mặt bằng | Đang triển khai |
| **Launch** | "Mở cửa mà không phải thuê tư vấn cho từng bước." | Đầu việc và cổng kiểm soát, Entry Copilot, kế hoạch kênh | Đang triển khai |
| **Scale** | "Giữ vị thế sau khai trương." | KPI, theo dõi kết quả, phân tích thành phố và thị trường tiếp theo | Đang triển khai |

## 2. Bản đồ năng lực

| Năng lực cấp 1 | Năng lực cấp 2 | Trạng thái |
|---|---|---|
| Trí tuệ gu (taste intelligence) | Xác định thực thể thương hiệu (Qloo `/search`), tín hiệu ngành dự phòng, thương hiệu liên quan kèm affinity (`/v2/insights`), địa điểm phổ biến theo thành phố | Đang chạy |
| Suy luận agent | 11 agent trong một lượt có schema; quy tắc kết luận gắn với chất lượng bằng chứng; kiểm tra phía máy chủ | Đang chạy |
| Bản địa hóa | Giao diện và đầu ra EN/VI; câu định vị của Localization Writer | Đang chạy |
| Market-Entry OS | Brand Workspace, playbook, hồ sơ pháp lý, pipeline đối tác, địa điểm, KPI, Entry Copilot | Đang triển khai |
| Market Packs | Từ khóa, thành phố, quận, ngôn ngữ, tiền tệ, vai trò đối tác, ghi chú pháp lý theo quốc gia | Kế hoạch |
| Marketplace hệ sinh thái | Nhà cung cấp dịch vụ, nhà vận hành, nhà đầu tư; kết nối; phí giao dịch | Kế hoạch |
| Vòng học | Lưu kết quả thực tế so với kết luận | Kế hoạch |
| Niềm tin và tuân thủ | Kết luận mang tính tư vấn, hiển thị bằng chứng, quản lý bí mật, nhãn demo/sample | Đang chạy |

## 3. Các bên liên quan

| Bên | Đóng góp | Nhận được |
|---|---|---|
| Thương hiệu nước ngoài | Phí thuê bao và phí thành công | Kết luận có bằng chứng, playbook gia nhập, đối tác đã thẩm định |
| Nhà vận hành, nhận nhượng quyền địa phương | Nhu cầu về mô hình muốn vận hành | Nguồn thương vụ chất lượng |
| Nhà cung cấp dịch vụ (pháp lý, logistics, môi giới mặt bằng, agency, KOL) | Dịch vụ qua marketplace | Dự án đã được sàng lọc |
| Nhà đầu tư | Vốn cho pilot và mở rộng | Luận điểm có bằng chứng, tiếp cận thương vụ |
| Cơ quan xúc tiến thương mại, ngân hàng, quỹ | Chương trình, kênh phân phối, giấy phép | Phân tích white-label cho thành viên, khách hàng |
| Người tiêu dùng Việt | Phản hồi, tín hiệu nhu cầu | Thương hiệu họ muốn, hợp gu địa phương |

## 4. Mô hình doanh thu (kế hoạch; chưa bật thanh toán)

| Sản phẩm | Mô hình | Giá dự kiến |
|---|---|---|
| Free scan | Thu hút khách hàng | $0, 1 lượt/tháng, mỗi lần một thành phố |
| Pro | Thuê bao | $149/tháng: không giới hạn, cả 3 thành phố, kết nối đối tác và pipeline, API |
| Enterprise | Giấy phép | Tùy chỉnh: white-label, đa khách thuê, Market Pack sớm, Outcome Data Vault |
| Phí thành công | Chia sẻ doanh thu | Một phần nhỏ doanh thu năm đầu tại Việt Nam khi ra mắt theo kết luận GO; không ra mắt, không thu |
| Marketplace | Phí giao dịch | Xác định khi marketplace mở |

## 5. Quy trình cốt lõi và KPI

Vai trò là vai trò mục tiêu; hiện nhà sáng lập đảm nhiệm.

| # | Quy trình | Phụ trách | KPI |
|---|---|---|---|
| P1 | Khách tiềm năng → free scan | Tăng trưởng | Số lượt/tuần; tỷ lệ chuyển sang Pro |
| P2 | Tạo kết luận | Insights | Thời gian xử lý; tỷ lệ có thực thể Qloo trực tiếp; tỷ lệ lỗi Qloo |
| P3 | Rà soát trước khi chia sẻ ra ngoài | Người rà soát | Tỷ lệ memo được rà soát |
| P4 | Thẩm định đối tác | Vận hành marketplace | Số đối tác theo thành phố và vai trò; thời gian kết nối |
| P5 | Thực thi playbook | Quản lý ra mắt | Số ngày mỗi giai đoạn so với kế hoạch; hạng mục pháp lý bị chặn |
| P6 | Ghi nhận kết quả | Dữ liệu | Tỷ lệ ra mắt có kết quả; chênh lệch kết luận và kết quả |
| P7 | Tuân thủ và bảo vệ dữ liệu | Tuân thủ | Nghĩa vụ còn mở; đánh giá luồng dữ liệu |

## 6. Quản trị

1. **Kết luận mang tính tư vấn.** Ứng dụng ghi rõ "Phân tích định hướng, không phải tư vấn tài chính" và liệt kê giới hạn ở trang About.
2. **Cổng bằng chứng.** Chỉ phân tích trên phản hồi Qloo thật; mọi lỗi Qloo dừng lượt chạy (`qloo_unavailable`); bằng chứng được trả về và hiển thị.
3. **Cổng đầu ra AI.** Cấm bịa số liệu, thị phần, xếp hạng; độ tin cậy dưới 70 khi không có thực thể trực tiếp; máy chủ ép kiểu và giới hạn 0–100.
4. **Gắn nhãn.** Mọi nội dung minh họa được ghi demo, sample, mô phỏng hoặc minh họa.
5. **Kiểm soát thay đổi.** Thay đổi vai trò agent, quy tắc kết luận hay schema phải qua pull request cập nhật [AGENTS.md](AGENTS.md) và [API.md](API.md).

## 7. Sổ rủi ro

| ID | Rủi ro | Khả năng | Tác động | Xử lý | Phụ trách |
|---|---|---|---|---|---|
| R1 | Dữ liệu Qloo mỏng cho thương hiệu hoặc thành phố | Trung bình | Cao | Ghi rõ dùng tín hiệu ngành; giới hạn độ tin cậy; hiển thị bằng chứng | Insights |
| R2 | LLM nêu số liệu không có trong bằng chứng | Trung bình | Cao | Cấm trong prompt, giới hạn giá trị, hiển thị bằng chứng, rà soát | Insights |
| R3 | Người dùng coi kết luận là bảo đảm | Thấp | Cao | Định vị tư vấn, trang giới hạn, tuyên bố miễn trừ | Người rà soát |
| R4 | Thu thập dữ liệu người tiêu dùng khi kiểm chứng | Trung bình | Cao | Đồng ý, giới hạn mục đích, thời hạn lưu theo luật BVDLCN | Tuân thủ |
| R5 | Lộ khóa API | Thấp | Cao | Chỉ trong Base44 secrets; không có trong repo hay bundle; xoay vòng khóa | Kỹ thuật |
| R6 | Đối tác vi phạm | Trung bình | Trung bình | Tiêu chí thẩm định, đánh giá, thanh toán theo giai đoạn (kế hoạch) | Vận hành marketplace |
| R7 | Thương hiệu không tuân thủ đăng ký, ATTP, ghi nhãn | Trung bình | Cao | Theo dõi hồ sơ pháp lý trong playbook; ưu tiên đối tác pháp lý | Tuân thủ |
| R8 | Phụ thuộc một nhà cung cấp dữ liệu và một nền tảng | Trung bình | Trung bình | Thiết kế adapter dữ liệu theo Market Pack; backend gọn trong một hàm | Kỹ thuật |
| R9 | Độ trễ LLM hoặc Qloo khi demo | Trung bình | Thấp | Timeout 15 giây, một lượt LLM, nút thử lại rõ ràng | Kỹ thuật |

## 8. Khả năng mở rộng

- **Market Packs:** mỗi quốc gia mới là cấu hình, không phải nhánh code. Tiếp theo: Thái Lan, Malaysia, Indonesia, Philippines.
- **Lõi API-first, đa khách thuê:** thương hiệu, nhà vận hành, nhà cung cấp và cơ quan dùng chung một API.
- **Agent Registry:** agent mới (Supplier Match, Legal Analyst, Hiring Planner) gắn vào với vai trò, công cụ và hợp đồng đầu ra.
- **Kho kết quả:** lưu mọi kết luận và kết quả sau đó để hiệu chỉnh và kiểm toán.

## 9. Góc nhìn nhà đầu tư

- **Bánh đà:** thêm nhà vận hành và nhà đầu tư → thêm thương hiệu → thêm thương vụ → thêm dữ liệu kết quả → dự đoán tốt hơn → thêm niềm tin.
- **Cửa tăng trưởng:** thêm quốc gia, chiều ngược lại (Việt Nam ra nước ngoài), thêm ngành, API và white-label, phí thành công.
- **Lộ trình:** Việt Nam (TP.HCM, Hà Nội, Đà Nẵng) → Đông Nam Á. Xem [ROADMAP.md](ROADMAP.md).
