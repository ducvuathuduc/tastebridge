# TasteBridge — Kiến trúc kinh doanh

> 🇬🇧 English: [BUSINESS_ARCHITECTURE.md](BUSINESS_ARCHITECTURE.md)

**Định vị:** *Quyết trong một cú nhấp. Phần còn lại chúng tôi lo từ A đến Z.* TasteBridge là cố vấn gia nhập thị trường đa tác tử và sàn đối tác, giúp **thương hiệu F&B nước ngoài vào Việt Nam** (chính) và **thương hiệu Việt ra nước ngoài** (phụ), dựa trên đồ thị khẩu vị văn hoá của Qloo.

**Căn chỉnh theo tiêu chuẩn.** Kiến trúc được thiết kế *căn chỉnh theo* — không phải *được chứng nhận* — các khung sau. Chưa đăng ký hay nhận chứng nhận nào.

| Khung | Áp dụng |
|---|---|
| ISO 56001 / 56002 (quản lý đổi mới) | Các giai đoạn cơ hội → ý tưởng → kiểm chứng → triển khai; rà soát danh mục; học từ kết quả |
| ISO 9001 (quản lý chất lượng) | Quy trình cốt lõi có tài liệu, người phụ trách, KPI, hành động khắc phục |
| ISO 31000 (quản lý rủi ro) | Sổ đăng ký rủi ro: khả năng, tác động, biện pháp, người phụ trách |
| ISO/IEC 27001 + 27701 (an toàn thông tin & quyền riêng tư) | Bí mật chỉ ở máy chủ, quyền tối thiểu, tối thiểu hoá dữ liệu, privacy by design |
| ISO 37301 (quản lý tuân thủ) | Sổ nghĩa vụ tuân thủ (đăng ký nhượng quyền, an toàn thực phẩm, bảo vệ dữ liệu), rà soát định kỳ |
| Luật Bảo vệ dữ liệu cá nhân Việt Nam | Đồng ý khi thu thập dữ liệu người tiêu dùng, giới hạn mục đích, quyền chủ thể dữ liệu, đánh giá chuyển dữ liệu ra nước ngoài |

## 1. Chuỗi giá trị

```
Khám phá ──▶ Quyết định ──▶ Kiểm chứng ──▶ Ra mắt ──▶ Tăng trưởng
```

| Giai đoạn | Kết quả cho khách hàng | Năng lực | Tác tử |
|---|---|---|---|
| Khám phá | "Việt Nam có hợp khẩu vị với chúng tôi?" | Taste-Fit Scan, Chỉ số Cơ hội F&B Việt Nam | Hồ sơ thương hiệu, Trinh sát, Săn mô hình tương tự |
| Quyết định | "Có nên đầu tư, ở đâu, rủi ro bao nhiêu?" | Hội đồng đầu tư, Điểm Taste-Fit tất định, dải ngân sách, bản ghi nhớ | Lạc quan, Thận trọng, Chủ tịch |
| Kiểm chứng | "Có người đặt trước trước khi ký mặt bằng?" | Trang đặt trước + quảng cáo bản địa | Kiểm chứng nhu cầu, Bếp trưởng bản địa hoá |
| Ra mắt | "Mở cửa mà không phải thuê tư vấn cho từng bước." | Kế hoạch A–Z, sàn đối tác (mặt bằng, pháp lý, cung ứng, KOL) | Kế hoạch A–Z, Kết nối đối tác, Bản đồ văn hoá |
| Tăng trưởng | "Giữ vị thế sau khai trương." | Giám sát khẩu vị, ghép nhượng quyền & vốn | Vòng giám sát (lộ trình) |

## 2. Bản đồ năng lực
- **Trí tuệ khẩu vị:** ánh xạ thực thể, thẻ, độ hợp tệp khách, bản đồ nhiệt khu vực, nhân khẩu học, văn hoá liên ngành.
- **Khoa học quyết định:** mô hình Taste-Fit tất định, quy tắc độ tin cậy, dải ngân sách theo ngân sách người dùng, ROI theo giả định người dùng.
- **Điều phối tác tử:** registry, function calling gốc, sổ bằng chứng, tự bổ sung công cụ bị bỏ sót, dự phòng nhà cung cấp LLM.
- **Market Pack:** danh mục thành phố, ngôn ngữ & tiền tệ, vai trò đối tác, ghi chú pháp lý.
- **Sàn đối tác, Kiểm chứng, Vòng học, Tin cậy & tuân thủ** (xem bản tiếng Anh).

## 3. Sáu bên và trao đổi giá trị
| Bên | Đóng góp | Nhận |
|---|---|---|
| Thương hiệu F&B nước ngoài | Phí (memo, thuê bao, thành công, chia doanh thu) | Phán quyết, ra mắt A–Z, đối tác đã thẩm định |
| Nhà vận hành / nhượng quyền chính | Đăng mô hình muốn vận hành | Nguồn thương hiệu phù hợp |
| Nhà đầu tư | Vốn thí điểm / mở rộng | Bản ghi nhớ có bằng chứng |
| Đối tác dịch vụ | Dịch vụ qua sàn | Dự án đã sàng lọc |
| Cơ quan xúc tiến (VIETRADE, JETRO, KOTRA) | Chương trình, đồng tài trợ | Báo cáo white-label |
| Người tiêu dùng | Đặt trước, phản hồi | Thương hiệu họ muốn, hợp khẩu vị |

## 4. Dòng doanh thu (giá **đề xuất**, chưa áp dụng)
Taste-Fit Scan miễn phí · Bản ghi nhớ $490/thị trường · Kiểm chứng nhu cầu $1.500 + quảng cáo · Launch OS $2.000/tháng + 8–12% phí sàn · Ghép nhượng quyền & vốn 3–5% · Bridge 1–2% doanh thu năm 1–3 · Giám sát $199/tháng · Insights API cho doanh nghiệp.

## 5. Quy trình cốt lõi, người phụ trách, KPI
| # | Quy trình | Phụ trách | KPI |
|---|---|---|---|
| P1 | Lead → Taste-Fit Scan | Trưởng tăng trưởng | Số scan/tuần; tỷ lệ chuyển sang memo |
| P2 | Tạo phán quyết đầu tư | Trưởng Insights | Thời gian; % số liệu truy được (mục tiêu 100%) |
| P3 | Người duyệt ký xác nhận | Người duyệt đầu tư | % phán quyết được ký trước khi chia sẻ (100%) |
| P4 | Chiến dịch kiểm chứng | Quản lý kiểm chứng | Đặt trước so với mục tiêu; chi phí/đặt trước |
| P5 | Thẩm định đối tác | Vận hành sàn | Số đối tác đã thẩm định theo thành phố & vai trò |
| P6 | Triển khai A–Z | Quản lý ra mắt | Ngày khai trương so với kế hoạch |
| P7 | Ghi nhận kết quả & hiệu chỉnh | Trưởng dữ liệu | % ra mắt có kết quả 90 ngày |
| P8 | Tuân thủ & bảo vệ dữ liệu | Cán bộ tuân thủ | Nghĩa vụ mở; DPIA cho luồng dữ liệu mới |

## 6. Quản trị
1. **Rà soát phán quyết:** mọi GO / PILOT / NO-GO là tư vấn; người duyệt có tên ký trước khi chia sẻ.
2. **Cổng chất lượng AI:** LLM không tạo số liệu; điểm, dải ngân sách, ROI tính bằng mã.
3. **Cổng chất lượng dữ liệu:** mỗi thành phố có hạng độ phủ và độ tin cậy; độ tin cậy thấp không bao giờ được GO.
4. **Rà soát danh mục hằng tháng** so sánh dự đoán với kết quả thực tế.
5. **Kiểm soát thay đổi** công thức điểm qua PR có test.

## 7. Sổ rủi ro
R1 độ phủ Qloo mỏng ở thành phố phụ · R2 LLM bịa số · R3 nhà đầu tư coi tư vấn là cam kết · R4 dữ liệu cá nhân người tiêu dùng · R5 lộ khoá API · R6 đối tác sai phạm · R7 thương hiệu không tuân thủ đăng ký nhượng quyền / ATTP · R8 phụ thuộc một nguồn dữ liệu · R9 giới hạn tốc độ LLM. Biện pháp chi tiết: xem bản tiếng Anh.

## 8. Khả năng mở rộng
Market Pack cho từng quốc gia (không fork mã) · lõi API đa khách thuê · agent registry · kho kết quả event-sourced cho vòng học.

## 9. Góc nhìn nhà đầu tư
Hiệu ứng mạng: nhiều nhà vận hành → nhiều thương hiệu → nhiều thương vụ → mô hình tốt hơn. Hướng mở rộng: quốc gia mới, ngành dọc mới (làm đẹp, bán lẻ, thời trang), chiều ngược Việt Nam → nước ngoài, API/white-label. Lộ trình: Việt Nam → Đông Nam Á → châu Á.
