# Phân hệ Quản trị ESG & Giám sát Năng lượng Thông minh (MISA AMIS ESG Simulator)
> **Nền tảng chuyển đổi kép: Chuyển đổi Số (Digital Transformation) gắn liền với Chuyển đổi Xanh (Green Transition)**  
> Ứng dụng mô phỏng quản trị phát thải khí nhà kính (GHG), tiêu thụ năng lượng và giám sát hiện trường thời gian thực (IoT/SCADA) theo lộ trình Net Zero 2050 và cam kết RE100 của Vinamilk.

---

## 📌 Mục lục
1. [Giới thiệu Tổng quan](#-giới-thiệu-tổng-quan)
2. [Mô hình Phân quyền & Kỳ Kiểm soát (3-Tier RBAC)](#-mô-hình-phân-quyền--kỳ-kiểm-soát-3-tier-rbac)
3. [Chi tiết Tính năng Các Phân hệ Con](#-chi-tiết-tính-năng-các-phân-hệ-con)
   - [3.1. Tổng quan Điều hành ESG (Dashboard Overview)](#31-tổng-quan-điều-hành-esg-dashboard-overview)
   - [3.2. Giám sát Thời gian thực & Đo đếm SCADA (Realtime Monitor)](#32-giám-sát-thời-gian-thực--đo-đếm-scada-realtime-monitor)
   - [3.3. Danh mục Thiết bị & Hạ tầng Năng lượng (Facilities View)](#33-danh-mục-thiết-bị--hạ-tầng-năng-lượng-facilities-view)
   - [3.4. Trung tâm Cảnh báo Sự cố & Khắc phục CAPA (Alerts Management)](#34-trung-tâm-cảnh-báo-sự-cố--khắc-phục-capa-alerts-management)
   - [3.5. Báo cáo Kiểm kê & Kiểm toán ESG (Audit Reports)](#35-báo-cáo-kiểm-kê--kiểm-toán-esg-audit-reports)
4. [Động cơ Mô phỏng Hiện trường (Simulation Control Engine)](#-động-cơ-mô-phỏng-hiện-trường-simulation-control-engine)
5. [Cơ chế Đo lường, Chuẩn mực Quốc tế & Biểu giá EVN](#-cơ-chế-đo-lường-chuẩn-mực-quốc-tế--biểu-giá-evn)
6. [Kiến trúc Kỹ thuật & Công nghệ (Tech Stack)](#-kiến-trúc-kỹ-thuật--công-nghệ-tech-stack)
7. [Hướng dẫn Cài đặt & Vận hành](#-hướng-dẫn-cài-đặt--vận-hành)

---

## 🌟 Giới thiệu Tổng quan

**MISA AMIS ESG Simulator** là phân hệ phần mềm tích hợp nằm trong hệ sinh thái quản trị doanh nghiệp **MISA AMIS ERP**, được thiết kế để giải quyết bài toán cốt lõi của các doanh nghiệp sản xuất quy mô lớn tại Việt Nam: **Định lượng, kiểm soát và giảm thiểu phát thải Carbon trực tiếp tại hiện trường sản xuất.**

Lấy bối cảnh thực tế từ chuỗi nhà máy và trang trại sinh thái đạt chuẩn Net Zero của **Vinamilk** (Mega Factory Bình Dương, NM Sữa Nghệ An, Trang trại Green Farm Tây Ninh), hệ thống cung cấp một bức tranh toàn diện từ lớp cảm biến vật lý IoT (OT - Operational Technology) đến lớp số liệu tài chính - kế toán ERP (IT - Information Technology).

---

## 🏢 Mô hình Phân quyền & Kỳ Kiểm soát (3-Tier RBAC)

Hệ thống thiết lập ma trận phân quyền 3 cấp độ với kỳ kiểm soát lũy kế chuyên biệt, đảm bảo tính chuẩn xác và bảo mật số liệu theo đúng vai trò nghiệp vụ:

```
┌─────────────────────────────────────────────────────────────────┐
│ CẤP 1: BAN GIÁM ĐỐC / BOD (Enterprise Scope - Toàn Doanh nghiệp)│
│  - Kỳ kiểm soát: Cả năm 2026 | 6T Đầu năm (H1) | 6T Cuối năm (H2)│
│  - Trọng tâm: Chỉ tiêu ESG vĩ mô, Hạch toán TK 627/642, Quỹ ETS │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│ CẤP 2: GIÁM ĐỐC NHÀ MÁY (Factory Scope - Từng Cơ sở Sản xuất)   │
│  - Phạm vi: NM Mega Bình Dương | NM Nghệ An | Trang trại Tây Ninh│
│  - Kỳ kiểm soát: Quý 1 | Quý 2 (Hiện tại) | Quý 3 | Quý 4        │
│  - Trọng tâm: Hạn mức phân xưởng, Năng lượng xanh, Kế hoạch CAPA │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│ CẤP 3: QUẢN ĐỐC XƯỞNG (Workshop Supervisor - Phân xưởng Cụ thể) │
│  - Phạm vi: Xưởng Tiệt trùng UHT | Đóng gói vô trùng | Kho AS/RS │
│  - Kỳ kiểm soát: Tháng 5 | Tháng 6 (Hiện tại) | Tháng 7          │
│  - Trọng tâm: Công suất tức thời kW, m³/h, Trạng thái máy móc   │
└─────────────────────────────────────────────────────────────────┘
```

### Nguyên tắc Đóng sổ & Bất biến Dữ liệu (Historical Immutability)
* **Kỳ đã đóng sổ (Closed Periods):** Các kỳ quá khứ (như H1 đối với BOD, Q1 đối với Giám đốc, Tháng 5 đối với Quản đốc) được coi là dữ liệu kiểm toán chốt sổ. Sự cố phát sinh trong quá khứ được bảo lưu vĩnh viễn và không tự động biến mất.
* **Xử lý sự cố (CAPA):** Biện pháp khắc phục sự cố mang ý nghĩa điều chỉnh và tối ưu hóa cho tương lai, ngăn chặn nguy cơ tái diễn mà không làm sai lệch số liệu tiêu thụ thực tế đã diễn ra trong quá khứ.

---

## 🚀 Chi tiết Tính năng Các Phân hệ Con

### 3.1. Tổng quan Điều hành ESG (Dashboard Overview)
*Mã điều hướng: `esg-dashboard`*

Trung tâm hiển thị bức tranh toàn cảnh về sức khỏe tiêu thụ năng lượng và chỉ tiêu môi trường của đơn vị:

1. **Bộ 4 Thẻ Chỉ số Điều hành (Executive KPI Stats):**
   * **Điện năng tiêu thụ (kWh):** Lũy kế điện năng so với định mức kỳ.
   * **Phát thải khí nhà kính (kg CO₂e):** Quy đổi theo hệ số lưới điện quốc gia và nhiên liệu lò hơi.
   * **Tiêu thụ Nước sạch (m³):** Lượng nước phục vụ vệ sinh CIP và nước cấp sản xuất.
   * **Hạ tầng Giám sát:** Đếm tổng số điểm đo IoT kết nối và số lượng cảnh báo an toàn đang kích hoạt.
   * *Tích hợp thanh đo 150%:* Trực quan hóa tiến độ bằng thanh tiến trình tỷ lệ 150%, có vạch mốc chuẩn 100% định mức và vùng cảnh báo tràn màu đỏ khi vượt quá ngưỡng.

2. **Biểu đồ Xu hướng Tiêu thụ Lũy kế (`ESGTrendChart`):**
   * Biểu đồ đường diện tích (Area & Spline SVG) thể hiện động thái tiêu thụ theo thời gian thực.
   * Đường giới hạn định mức kỳ (Quota Limit Beacon) giúp phát hiện ngay thời điểm chớm chạm ngưỡng.
   * Vòng sóng radar ping đồng tâm (`<animate>`) đánh dấu chính xác các điểm mốc vượt định mức mà không bị trôi tọa độ.
   * Bộ lọc linh hoạt chuyển đổi giữa: *Tất cả chỉ số | Điện năng | Phát thải CO₂ | Nước*.

3. **Biểu đồ So sánh Định mức & Thực tế theo Cấp bậc (`ESGComparisonChart`):**
   * Tự động điều chỉnh trục phân tích theo vai trò: BOD so sánh giữa các Nhà máy; Giám đốc so sánh giữa các Phân xưởng; Quản đốc so sánh giữa các Cụm máy.
   * Thước đo trực quan phân loại màu sắc: Xanh lá (<85% - Tối ưu), Vàng cam (85-100% - Cận định mức), Đỏ (>100% - Vượt định mức).

4. **Cơ cấu Năng lượng Xanh & Kiểm soát Phát thải (`ESGRenewableEnergyWidget`):**
   * Phân bổ tỷ trọng năng lượng thực tế theo mô hình Vinamilk RE100:
     * **Điện mặt trời áp mái (Solar Rooftop 5.4 MWp):** Tự cấp cho cụm kho và chiếu sáng.
     * **Nhiên liệu Sinh khối (Biomass Boiler 10 T/h):** Đốt trấu ép/mùn cưa thay thế 100% dầu FO/DO lò hơi.
     * **Khí sinh học (Biogas):** Tận dụng chất thải hữu cơ từ trang trại bò sữa Green Farm.
     * **Lưới điện truyền tải EVN:** Nguồn điện nền vận hành 24/7.
   * **Bộ 3 chỉ số vận hành xanh:**
     * *Sản lượng Xanh tự cấp (MWh):* Tổng năng lượng sạch tự tạo ra trong kỳ.
     * *CO₂ tránh phát thải (kg CO₂e):* Khối lượng phát thải đã triệt tiêu tại nguồn.
     * *Mức độ Tự chủ Năng lượng (%):* Tỷ lệ thay thế nguồn điện than hóa thạch.

5. **Tác động Tài chính & Chi phí Năng lượng MISA AMIS ERP (`ESGFinancialImpactWidget`):**
   * Tự động tính toán chi phí tiền điện dự tính theo biểu giá EVN 3 giá.
   * Phụ phí vận hành giờ cao điểm (Peak-hour surcharge).
   * Dự phòng rủi ro tuân thủ thị trường mua bán tín chỉ Carbon ETS (120.000 VNĐ / tấn CO₂e).
   * Thống kê số tiền tiết kiệm được nhờ năng lượng sạch tự sản xuất.
   * Hạch toán trực tiếp vào hệ thống sổ cái kế toán: **TK 627** (Chi phí sản xuất chung) và **TK 642** (Chi phí quản lý doanh nghiệp).

6. **Bảng Xếp hạng Tuân thủ ESG (`ESGRankingTable`):**
   * Tự động chấm điểm và xếp loại các đơn vị cấp dưới theo mức độ tuân thủ định mức (Loại A, B, C, D).

7. **Danh sách Cảnh báo Nhanh (`ESGAlertsList`):**
   * Hiển thị tức thời các bất thường với tính năng **1-click SCADA Drilldown**: Nhấn vào nút chi tiết sẽ chuyển thẳng đến màn hình giám sát hiện trường của thiết bị đó.

---

### 3.2. Giám sát Thời gian thực & Đo đếm SCADA (Realtime Monitor)
*Mã điều hướng: `esg-realtime`*

Phân hệ đóng vai trò như một hệ thống SCADA / Digital Twin thu nhỏ, phục vụ đội ngũ kỹ sư vận hành và quản đốc phân xưởng:

1. **Sơ đồ Mặt bằng Nhà máy & Cụm thiết bị IoT (Plant Floorplan & Telemetry):**
   * Cấu trúc cây tài sản phân tầng: Doanh nghiệp $\to$ Nhà máy $\to$ Phân xưởng $\to$ Cụm máy đo đếm (Smart Meter).
   * Giám sát thông số tức thời: Công suất điện (kW), Lưu lượng nước (m³/h), Tải khí nén (bar), Nhiệt độ lò hơi (°C).
   * Trực quan hóa tải tức thời so với công suất thiết kế bằng thanh đo 150%.

2. **Bản đồ Nhiệt Tiêu thụ Điện 24/7 theo Biểu giá EVN (`ESGHeatmapEVN`):**
   * Ma trận trực quan **7 ngày trong tuần $\times$ 24 khung giờ trong ngày**.
   * Phân loại chính xác 3 khung giờ biểu giá của Tập đoàn Điện lực Việt Nam (EVN):
     * 🟢 **Giờ thấp điểm (22:00 - 04:00):** Giá thấp nhất (1.180 đ/kWh) — Khung giờ tối ưu chạy tác vụ nặng (sạc xe nâng, làm lạnh sâu kho bảo quản).
     * 🟡 **Giờ bình thường (04:00 - 09:30, 11:30 - 17:00, 20:00 - 22:00):** Giá tiêu chuẩn (1.780 đ/kWh).
     * 🔴 **Giờ cao điểm (09:30 - 11:30, 17:00 - 20:00):** Giá cao nhất (3.250 đ/kWh) — Khung giờ cần hạn chế hoặc dịch chuyển phụ tải.
   * Cho phép hoán đổi 3 chế độ góc nhìn: **Công suất tiêu thụ (kW)**, **Ước tính tiền điện (VNĐ)**, và **Dấu chân Carbon (kg CO₂)**.
   * Tính toán tỷ số phụ tải đỉnh/đáy (PAR - Peak-to-Average Ratio) giúp quản đốc đánh giá độ san bằng biểu đồ phụ tải.

3. **Cảnh báo Dự báo Sớm Vỡ Định mức (`ESGPredictiveAlert`):**
   * Thuật toán dự phóng tốc độ tiêu thụ hiện tại (Run-rate kW) đến thời điểm đóng sổ cuối kỳ.
   * Đưa ra cảnh báo định lượng về nguy cơ vượt định mức trước khi sự cố thực sự xảy ra.
   * Ước tính chính xác ngày chạm ngưỡng vi phạm (ETA Breach Date) và số lượng kWh dự kiến thâm hụt.

---

### 3.3. Danh mục Thiết bị & Hạ tầng Năng lượng (Facilities View)
*Mã điều hướng: `esg-facilities`*

Sổ tay quản trị tài sản (Asset Directory) chuẩn CMMS:
* Quản lý thông tin chi tiết từng tài sản: Mã thiết bị, hãng sản xuất, năm đưa vào vận hành, định mức công suất tối đa, ngưỡng cảnh báo an toàn.
* Thống kê lịch sử kiểm định an toàn, nhật ký bảo dưỡng định kỳ và nhật ký thay thế linh kiện.
* Bộ lọc phân loại tài sản theo khu vực lắp đặt và trạng thái hoạt động thực tế (Đang chạy, Vượt định mức, Dừng bảo trì).

---

### 3.4. Trung tâm Cảnh báo Sự cố & Khắc phục CAPA (Alerts Management)
*Mã điều hướng: `esg-alerts`*

Quy trình quản lý sự cố khép kín chuẩn HSE và ISO 50001 (Energy Management):
* **Phân cấp mức độ sự cố:**
  * 🔴 **Nghiêm trọng (Critical):** Vượt định mức >100%, nguy cơ gây quá tải trạm biến áp hoặc dừng chuyền.
  * 🟡 **Cảnh báo (Warning):** Chạm ngưỡng cảnh báo sớm (85-100%).
  * 🔵 **Thông tin (Info):** Thông báo trạng thái vận hành và biến động nhẹ.
* **Quy trình Khắc phục & Phòng ngừa (CAPA - Corrective and Preventive Action):**
  * Bước 1: Ghi nhận cảnh báo tự động từ cảm biến IoT.
  * Bước 2: Phân công kỹ sư chịu trách nhiệm hiện trường.
  * Bước 3: Lập phiếu biện pháp kỹ thuật (điều chỉnh biến tần, sửa chữa đường ống, cân bằng tải).
  * Bước 4: Nghiệm thu và đóng hồ sơ sự cố.
* **Liên kết 2 chiều:** Bấm xem vị trí sự cố sẽ mở trực tiếp màn hình thiết bị trên sơ đồ mặt bằng SCADA.

---

### 3.5. Báo cáo Kiểm kê & Kiểm toán ESG (Audit Reports)
*Mã điều hướng: `esg-reports`*

Bộ công cụ phục vụ kiểm toán độc lập và lập báo cáo phát triển bền vững thường niên:
* **Kiểm kê khí nhà kính theo chuẩn quốc tế GHG Protocol:**
  * **Scope 1 (Phát thải trực tiếp):** Khí thải từ lò hơi đốt nhiên liệu sinh khối, máy phát điện diesel dự phòng, rò rỉ môi chất lạnh.
  * **Scope 2 (Phát thải gián tiếp):** Lượng phát thải từ điện năng mua ngoài lưới điện quốc gia EVN.
  * **Scope 3 (Phát thải chuỗi giá trị):** Đang mở rộng phục vụ đo đếm vận chuyển nguyên liệu sữa tươi từ trang trại.
* **Bảng Đánh giá Tuân thủ Chỉ tiêu (Compliance Checklist):** Tự động đối soát số liệu tiêu thụ với hạn ngạch đăng ký đầu kỳ và cấp nhãn đánh giá (Đạt chuẩn / Cần khắc phục).
* **Xuất biên bản kiểm toán:** Hỗ trợ in ấn và xuất dữ liệu phục vụ thanh tra môi trường và các đơn vị kiểm toán bên thứ ba (BSI, PwC, EY, Bureau Veritas).

---

## 🎛️ Động cơ Mô phỏng Hiện trường (Simulation Control Engine)

Bảng điều khiển mô phỏng (`SimulationControlPanel`) là trái tim tạo nên tính tương tác sống động và chân thực của ứng dụng, được cấu trúc theo 3 phân khu chuyên biệt:

### 4.1. Thiết kế Giao diện Thông minh (Floating Capsule Pill)
* **Nút điều khiển nổi dạng viên thuốc (Floating Pill):** Nằm gọn gàng tại góc dưới bên phải màn hình, không che khuất không gian làm việc.
* **Huy hiệu kịch bản tức thời (Dynamic Scenario Badge):** Khi thu gọn, nút nổi vẫn hiển thị tên kịch bản đang vận hành (ví dụ: `Ca sản xuất cao điểm`, `Sự cố lò hơi sinh khối`) và đèn tín hiệu nhấp nháy luồng truyền SCADA.
* **Còi báo động SCADA thực tế (Audio Alarm Synthesizer):** Tích hợp bộ phát âm thanh chuông đôi công nghiệp ($880\text{ Hz} \to 659\text{ Hz}$) sử dụng Web Audio API gốc của trình duyệt, cung cấp nút gạt bật/tắt `🔊 Còi: Bật` / `🔇 Còi: Tắt` ngay trên thanh tiêu đề.

---

### 4.2. Tab 1: 6 Kịch bản Vận hành Công nghiệp Thực tế (1-Click Presets)
Cho phép người dùng kích hoạt tức thời các kịch bản sản xuất thực tế tại chuỗi nhà máy Vinamilk:

1. **⚡ Ca sản xuất Cao điểm (Peak Production Shift):**
   * *Bối cảnh:* Dây chuyền Tiệt trùng UHT và Chiết rót Aseptic chạy 100% công suất để kịp đơn hàng xuất khẩu đi thị trường Mỹ/EU.
   * *Tác động:* Phụ tải thiết bị tăng vọt lên **98% - 105% công suất thiết kế**, ghi nhận cảnh báo cận tải trên toàn nhà máy và phát âm thanh cảnh báo SCADA.
2. **🌿 Chế độ Vận hành Xanh RE100 (Eco-Green Optimization):**
   * *Bối cảnh:* Kích hoạt chính sách tiết kiệm điện năng và tối ưu hóa nguồn cung xanh.
   * *Tác động:* Tối đa hóa công suất Solar Rooftop 5.4 MWp và lò hơi trấu ép, giảm phụ tải mua ngoài EVN, đưa các chỉ số về dải màu xanh an toàn (<70%) và giảm **35% phát thải CO₂**.
3. **🔥 Sự cố Lò hơi Sinh khối (Boiler Combustion Anomaly):**
   * *Bối cảnh:* Kẹt ghi buồng đốt tầng sôi lò trấu ép 10 T/h, nhà máy buộc phải chuyển sang đốt dầu FO/DO dự phòng.
   * *Tác động:* Phát thải CO₂ tức thời vọt tăng **138% ngưỡng quy chuẩn**, kích hoạt cảnh báo đỏ Critical cấp nhà máy và còi báo động SCADA.
4. **💧 Bục Đường ống Nước Vệ sinh CIP (CIP Pipe Burst):**
   * *Bối cảnh:* Bục gioăng áp lực đường ống nước tẩy rửa tiệt trùng CIP tại Xưởng Chế biến sữa tiệt trùng.
   * *Tác động:* Lưu lượng nước sạch m³/h vọt lên **145% định mức**, bừng đỏ trên sơ đồ mặt bằng SCADA.
5. **☀️ Nắng Đạt đỉnh Giữa trưa (100% Solar Peak):**
   * *Bối cảnh:* Bức xạ quang năng đạt cực đại ($1.000\text{ W/m}^2$) vào khung giờ 11:30 - 13:30.
   * *Tác động:* Hệ thống Solar Rooftop phát 100% công suất 5.4 MWp, tự cấp hoàn toàn cho Cụm kho thông minh AS/RS và chiếu sáng.
6. **⚠️ Giờ Cao điểm Điện lực EVN (Demand-Response Surcharge):**
   * *Bối cảnh:* Lưới điện quốc gia chuyển sang khung giờ cao điểm (09:30-11:30 & 17:00-20:00) với mức giá đắt nhất $3.250\text{ đ/kWh}$ ($+82\%$).
   * *Tác động:* Kích hoạt cảnh báo điều tiết phụ tải, tự động khuyến nghị dịch chuyển các tác vụ nặng (như sạc pin xe nâng tự động AGV) sang giờ thấp điểm ban đêm.

---

### 4.3. Tab 2: Phân quyền 3 Cấp & Kiểm soát Sự cố Kỳ Đóng sổ
* **Mô phỏng 3 vai trò người dùng:** Ban Giám đốc (BOD) $\leftrightarrow$ Quản đốc Nhà máy $\leftrightarrow$ Trưởng bộ phận Phân xưởng.
* **Bộ chọn phạm vi thử nghiệm:** Cho phép lựa chọn nhanh từng cơ sở sản xuất (NM Bình Dương, NM Nghệ An, Trang trại Green Farm Tây Ninh) và từng phân xưởng.
* **Cơ chế kiểm soát Kỳ Đóng sổ vs Kỳ Hiện tại:**
  * 🔒 *Kỳ đã đóng sổ:* Dữ liệu sự cố cộng dồn vào quá khứ và cả năm, kỳ hiện tại giữ nguyên không bị ảnh hưởng theo nguyên tắc bất biến kiểm toán.
  * 🔴 *Kỳ hiện tại (Live):* Đẩy vọt công suất tức thời vượt ngưỡng 100%, làm thanh tiến trình live bừng đỏ cảnh báo tràn.

---

### 4.4. Tab 3: Khung giờ EVN 3 Giá, Thời tiết & Động cơ SCADA Live
* **Mô phỏng Khung giờ Biểu giá EVN:**
  * 🟢 *Giờ thấp điểm (22h - 04h):* Biểu giá $1.180\text{ đ/kWh}$.
  * 🟡 *Giờ bình thường (Tiêu chuẩn):* Biểu giá $1.780\text{ đ/kWh}$.
  * 🔴 *Giờ cao điểm (+82%):* Biểu giá $3.250\text{ đ/kWh}$.
* **Mô phỏng Bức xạ Thời tiết Năng lượng Mặt trời:**
  * ☀️ *Nắng gắt:* Hiệu suất Solar đạt $100\%$.
  * ⛅ *Nhiều mây:* Hiệu suất Solar đạt $60\%$.
  * 🌧️ *Mưa bão:* Hiệu suất Solar suy giảm còn $15\%$, nhà máy tự động tăng tỷ trọng nhận từ điện lưới.
* **Điều khiển Truyền dữ liệu SCADA Live:**
  * Bật/Tắt luồng truyền dữ liệu thời gian thực.
  * Tùy chỉnh tần số cập nhật: Nhanh ($1.5\text{s}$), Tiêu chuẩn ($3.0\text{s}$), Chậm ($6.0\text{s}$).
  * Biên độ dao động ngẫu nhiên: Thấp ($\pm 1.5\%$), Vừa ($\pm 3.5\%$), Cao ($\pm 7\%$).
  * Nút **Khôi phục Cài đặt Gốc (Reset):** Đưa toàn bộ hệ thống về trạng thái baseline chuẩn ban đầu.

---

## 📐 Cơ chế Đo lường, Chuẩn mực Quốc tế & Biểu giá EVN

| Chỉ số / Tiêu chuẩn | Đơn vị tính | Phương pháp & Quy chuẩn áp dụng |
| :--- | :---: | :--- |
| **Điện năng tiêu thụ** | `kWh` / `MWh` | Đo đếm trực tiếp qua công tơ điện tử đa năng IoT. |
| **Phát thải KNK (Scope 2)** | `kg CO₂e` | Nhân sản lượng điện lưới EVN với hệ số phát thải lưới quốc gia ($0.72\text{ kg CO}_2/\text{kWh}$). |
| **Phát thải KNK (Scope 1)** | `kg CO₂e` | Tính toán từ lượng nhiên liệu lò hơi và môi chất lạnh theo hướng dẫn IPCC 2006. |
| **Tiêu thụ nước sạch** | `m³` | Đo lưu lượng cấp nước nhà máy và định mức tuần hoàn nước ngưng CIP. |
| **Biểu giá điện 3 giá EVN** | `VNĐ/kWh` | Áp dụng khung giá điện sản xuất công nghiệp cấp điện áp 22kV - 110kV (Giờ thấp điểm: 1.180 đ, Bình thường: 1.780 đ, Cao điểm: 3.250 đ). |
| **Dự phòng Tín chỉ ETS** | `VNĐ` | Dự phòng tài chính 120.000 VNĐ cho mỗi tấn CO₂e phát thải vượt hạn mức. |
| **Chuẩn mực Báo cáo** | — | Tuân thủ các tiêu chuẩn quốc tế: **GRI 302** (Năng lượng), **GRI 305** (Phát thải), **GRI 303** (Nước), **GHG Protocol**, và **ISO 50001**. |

---

## 💻 Kiến trúc Kỹ thuật & Công nghệ (Tech Stack)

* **Core Framework:** [Next.js 16 (App Router)](https://nextjs.org/) với trình biên dịch siêu tốc **Turbopack**.
* **Frontend Library:** [React 19](https://react.dev/) (`useClient`, hooks, functional components).
* **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/) đảm bảo an toàn kiểu dữ liệu (Strict Type-Safety).
* **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/) cho giao diện hiện đại, chuẩn thiết kế công nghiệp cao cấp.
* **Biểu tượng:** [Lucide React](https://lucide.dev/) (Bộ icon đồ họa vector tinh gọn).
* **Quản trị Trạng thái Toàn cục (State Management):** React Context API (`ESGSimulationContext`) quản lý đồng bộ dữ liệu vai trò, kỳ kiểm soát, luồng dữ liệu SCADA và hàng đợi cảnh báo.
* **Trực quan hóa Dữ liệu (SVG Native Visualizations):**
  * Toàn bộ biểu đồ spline diện tích, thanh nhiệt heatmap và vạch định mức được vẽ bằng **SVG Native**.
  * Sử dụng SMIL Native `<animate>` cho hiệu ứng radar ping, đảm bảo tuyệt đối không bị giật tọa độ và đạt hiệu năng render 60fps mà không cần thư viện đồ thị cồng kềnh.
* **Âm thanh Cảnh báo Hiện trường (Industrial Audio Synthesizer):**
  * Sử dụng **Web Audio API** gốc phát sóng âm chuông đôi tần số kép ($880\text{ Hz} \to 659\text{ Hz}$) hoàn toàn từ client, không phụ thuộc tài nguyên mạng hay file mp3 ngoài.

---

## 🛠️ Hướng dẫn Cài đặt & Vận hành

### Yêu cầu môi trường
* **Node.js:** Phiên bản `>= 18.17.0` (Khuyên dùng Node LTS 20+).
* **Trình quản lý gói:** `npm`, `yarn`, `pnpm`, hoặc `bun`.

### Các bước cài đặt

1. **Clone repository về máy cục bộ:**
   ```bash
   git clone https://github.com/phanchauthieukhang/misa-amis-simulator.git
   cd misa-amis-simulator
   ```

2. **Cài đặt các gói phụ thuộc:**
   ```bash
   npm install
   ```

3. **Khởi chạy máy chủ phát triển (Development Server):**
   ```bash
   npm run dev
   ```
   *Mở trình duyệt và truy cập vào:* `http://localhost:3000`

4. **Biên dịch bản chạy chính thức (Production Build):**
   ```bash
   npm run build
   npm run start
   ```

---

*Hệ thống được phát triển nhằm mô phỏng và định hình tiêu chuẩn quản trị năng lượng thông minh, đồng hành cùng doanh nghiệp Việt Nam trên lộ trình Chuyển đổi số và Net Zero bền vững.*
