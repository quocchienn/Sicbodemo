# 🎲 Xí Ngầu (Sicbo) - Trò Chơi Tự Động Quay

Đây là một triển khai đơn giản của trò chơi Sicbo (Xí Ngầu), được tùy chỉnh để chạy hoàn toàn tự động với các tính năng đếm ngược thời gian và quản lý cược tiện lợi.

## 🌟 Chức năng nổi bật

* **Tự động quay (Auto-Roll):** Trò chơi tự động thực hiện các vòng quay xúc xắc mà không cần bất kỳ tương tác thủ công nào từ người chơi. Sau mỗi kết quả, trò chơi sẽ tự động chuyển sang vòng tiếp theo.
* **Hiển thị kết quả & Đếm ngược:**
    * [span_0](start_span)Kết quả của xúc xắc và các thông tin thắng/thua được hiển thị rõ ràng sau mỗi lần quay[span_0](end_span).
    * [span_1](start_span)[span_2](start_span)Sau khi hiển thị kết quả trong khoảng thời gian nhất định (6 giây)[span_1](end_span)[span_2](end_span)[span_3](start_span), các mặt xúc xắc sẽ được reset về dấu hỏi chấm (`?`) và một bộ đếm ngược sẽ xuất hiện[span_3](end_span).
    * [span_4](start_span)[span_5](start_span)Bộ đếm ngược này cho biết thời gian còn lại (10 giây)[span_4](end_span)[span_5](end_span) [span_6](start_span)[span_7](start_span)trước khi vòng quay tiếp theo tự động bắt đầu[span_6](end_span)[span_7](end_span).
* **[span_8](start_span)Xóa cược:** Nút "🗑️ Xóa Cược" cho phép người chơi nhanh chóng loại bỏ tất cả các cược đã đặt trên bàn[span_8](end_span). [span_9](start_span)Số tiền đã cược sẽ được hoàn lại vào số dư của người chơi[span_9](end_span).
* **[span_10](start_span)Đặt cược linh hoạt:** Người chơi có thể chọn các mệnh giá chip khác nhau (10, 50, 100, 500 xu)[span_10](end_span) [span_11](start_span)[span_12](start_span)và đặt cược vào nhiều tùy chọn khác nhau trên bảng cược, bao gồm tổng điểm, Tài/Xỉu, Chẵn/Lẻ và cược số đơn[span_11](end_span)[span_12](end_span).
* **[span_13](start_span)[span_14](start_span)Lịch sử kết quả:** Một phần lịch sử hiển thị các kết quả của các vòng chơi trước đó, giúp người chơi theo dõi xu hướng[span_13](end_span)[span_14](end_span).
* **[span_15](start_span)[span_16](start_span)Lưu trạng thái trò chơi:** Số dư hiện tại và lịch sử kết quả được tự động lưu trữ trong trình duyệt (Local Storage), đảm bảo rằng tiến trình của bạn không bị mất khi đóng và mở lại trò chơi[span_15](end_span)[span_16](end_span).
* **[span_17](start_span)Giao diện phản hồi (Responsive Design):** Giao diện người dùng được thiết kế để hiển thị tốt trên nhiều kích thước màn hình khác nhau, từ máy tính để bàn đến thiết bị di động[span_17](end_span).

## 🛠️ Cài đặt và Chạy

1.  **Clone repository (nếu có) hoặc tải xuống các tệp:**
    * `index.html`: Tệp HTML chính chứa cấu trúc trò chơi.
    * [span_18](start_span)`style.css`: Tệp CSS chứa tất cả các kiểu dáng và biến màu sắc[span_18](end_span).
    * `script.js`: Tệp JavaScript chứa toàn bộ logic trò chơi.
2.  **Mở tệp `index.html`** bằng trình duyệt web của bạn.

Trò chơi sẽ tự động khởi động và các vòng quay sẽ diễn ra theo chu kỳ.
