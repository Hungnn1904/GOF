# MODULE SERVER (Kiến trúc P2P / Signaling)
Phần Server đóng vai trò trung tâm kết nối và điều phối trong toàn bộ hệ thống trò chơi. Khác với mô hình Client-Server truyền thống, server này không trực tiếp xử lý logic game (như vật lý, di chuyển hay va chạm). Thay vào đó, nó hoạt động như một Lobby Server (Máy chủ sảnh) và Signaling Server (Máy chủ báo hiệu).

Khi hệ thống khởi động, server chịu trách nhiệm tạo môi trường sảnh (Lobby), quản lý danh sách các phòng chơi, xử lý việc tạo phòng, và cho phép người chơi tham gia (kiểm tra mật khẩu, trạng thái phòng). Nó cũng quản lý việc chat chung ở sảnh.

Khi một người chơi tham gia vào một phòng, server sẽ cấp cho họ một danh tính riêng (ID) và quan trọng nhất là chỉ định một người chơi làm Host (Chủ phòng), thường là người vào đầu tiên. Server cũng chịu trách nhiệm chuyển tiếp tin nhắn chat riêng trong phòng đó.

Vai trò kỹ thuật then chốt của server là "báo hiệu" (Signaling). Nó hoạt động như một tổng đài, giúp chuyển tiếp các tin nhắn WebRTC (offer, answer, candidate) giữa Host và các người chơi (Guest) khác. Quá trình này cho phép các client thiết lập một kết nối P2P (Peer-to-Peer - Hàng ngang) trực tiếp với nhau.

Sau khi kết nối P2P được thiết lập, server sẽ "rút lui" khỏi việc truyền tải dữ liệu game. Toàn bộ logic của trò chơi—bao gồm di chuyển, quay kiếm, va chạm, trừ máu, và hồi sinh—sẽ được chạy và tính toán trực tiếp trên máy của Host. Host sẽ gửi thông tin cập nhật trạng thái trực tiếp đến các Guest qua kết nối P2P.

Vai trò cuối cùng của server là nhận các lệnh điều khiển (như start_game, end_game) từ Host và thông báo chúng cho tất cả client khác trong phòng, giúp mọi người chơi đồng bộ trạng thái.

## 🎯 MỤC TIÊU
Phần Server trong hệ thống được xây dựng nhằm đảm bảo toàn bộ hoạt động của trò chơi được xử lý tập trung và nhất quán.
Mục tiêu chính của server bao gồm:
1. Tiếp nhận yêu cầu từ client
    - Tiếp nhận và duy trì kết nối WebSocket của người chơi tại Sảnh (Lobby) hoặc trong Phòng (Room).
    - Quản lý các kết nối mới và duy trì danh sách người chơi đang tham gia.
    - Tiếp nhận và chuyển tiếp (relay) tin nhắn chat ở sảnh (chat_global) và chat trong phòng (chat_room).

2. Điều phối Phòng chơi và Báo hiệu (Signaling)
    - Chỉ định một người chơi trong phòng làm Host (người vào đầu tiên).
    - Tính toán kết quả, cập nhật trạng thái của các đối tượng trong trò chơi (vị trí, máu, trạng thái sống/chết,…).
    - Signaling server: Nhận và chuyển tiếp các tin nhắn kỹ thuật WebRTC (offer, answer, candidate) giữa Host và các Guest.

3. Đồng bộ Trạng thái
    - Gửi thông tin cập nhật về danh sách người chơi và hostId cho tất cả client trong phòng .
    - Nhận các lệnh từ Host và phát  các lệnh này đến các client khác, giúp đồng bộ trạng thái.

4. Duy trì hoạt động ổn định và Dọn dẹp
    - Quản lý chu kỳ hoạt động để hệ thống luôn chạy ổn định, không bị gián đoạn.
    - Tự động phát hiện và dọn dẹp các phòng chơi đã trống (không còn người chơi) để giải phóng tài nguyên.

 -> Phần Server là "trung tâm điều phối và mai mối" (Matchmaking & Coordination Hub), giúp các client tìm thấy nhau, thiết lập kết nối P2P, và đồng bộ các trạng thái chung, trong khi toàn bộ logic game được chuyển giao cho một client (Host) xử lý.

## ⚙️ CÔNG NGHỆ SỬ DỤNG

| Thành phần | Công nghệ |
|------------|-----------|
| Ngôn ngữ | JavaScript (chạy trên môi trường Node.js) |
| Framework | Express.js, WebSocket (ws) |
| Database | Không sử dụng (toàn bộ dữ liệu được lưu và xử lý tạm thời trong bộ nhớ RAM của server) |
| Công Cụ phát triển | NetBeans IDE |
| Môi Trường | Node.js runtime | 
| Giao thức giao tiếp | HTTP + WebSocket |
| Client-side | HTML5, CSS3, JavaScript (Canvas API) |
---

📝 Giải thích(Kiến trúc P2P / Signaling)
    Phần server của hệ thống được lập trình bằng Node.js, giúp xử lý bất đồng bộ hiệu quả, phù hợp để quản lý nhiều kết nối cùng lúc cho Sảnh (Lobby) và "báo hiệu" (Signaling).
    Express.js: Được dùng để phục vụ các file giao diện (HTML, CSS, client-side JS) cho người chơi.
    WebSocket (ws): Là công nghệ cốt lõi, đảm nhận việc trao đổi dữ liệu hai chiều. Tuy nhiên, vai trò của nó đã thay đổi. Giờ đây, WebSocket chủ yếu dùng để:
    - Quản lý Sảnh và Chat (chung và riêng).
    - Truyền tải các lệnh (như start_game).
    - Làm "tổng đài" chuyển tiếp tin nhắn báo hiệu WebRTC (giúp các client kết nối P2P).
    RAM: Dữ liệu được xử lý trên RAM của server giờ đây rất nhẹ, chủ yếu chỉ là thông tin quản lý phòng (ai ở đâu, ai là Host). Toàn bộ logic game (vật lý, va chạm) đã được chuyển về máy của người chơi Host để xử lý.
    NetBeans: Là môi trường (IDE) mà nhóm sử dụng để lập trình, quản lý và gỡ lỗi dự án

## 🚀 HƯỚNG DẪN CHẠY

### Cài đặt
1.Mở Netbean:
<img width="1918" height="1003" alt="image" src="https://github.com/user-attachments/assets/e0ec9ed1-2ed2-43c4-8373-17391007ad06" />

2.Nhấn HTML5/JavaScript và tạo project với HTML5/JS App with Node.js:
<img width="895" height="614" alt="image" src="https://github.com/user-attachments/assets/f6297540-c25a-49f1-bf5a-4f1fb4270278" />
<img width="894" height="280" alt="image" src="https://github.com/user-attachments/assets/69f9fa00-7ffa-438f-b286-b6024e4f644a" />
3.Cài đặt nodejs xong và bắt đầu code:
<img width="296" height="120" alt="image" src="https://github.com/user-attachments/assets/82e168a7-d28d-4870-97ce-7ab4beea8cc0" />
<img width="320" height="139" alt="image" src="https://github.com/user-attachments/assets/f89cb736-b8b0-477c-a84a-d044ff707462" />


### Khởi động server
<img width="446" height="243" alt="image" src="https://github.com/user-attachments/assets/d1d87f15-c758-4d49-ab2e-c33e4c95551a" />


Server chạy tại: `http://localhost:3000`
<img width="487" height="110" alt="image" src="https://github.com/user-attachments/assets/abedb19e-7fe4-436a-9b62-3c6a055debc3" />


## 🔗 API

| **Endpoint**                | **Method** | **Input**               | **Output / Mô tả**                                                                            |
| --------------------------- | ---------- | ----------------------- | --------------------------------------------------------------------------------------------- |
| `/`                         | GET        | —                       | Trả về trang giao diện chính của trò chơi (`index.html`).                                     |
| `/health`                   | GET        | —                       | `{ "status": "ok" }` → kiểm tra server đang hoạt động bình thường.                            |
| `/assets/...`               | GET        | —                       | Cung cấp các file tĩnh (ảnh, âm thanh, mã JavaScript, CSS).                                   |
| `/api/restart` *(tuỳ chọn)* | POST       | `{ "adminKey": "..." }` | `{ "message": "Server restarted" }` – dùng khi cần khởi động lại game (nếu có chức năng này). |

🔸 Kênh WebSocket: ws://<ip-server>:3000
Kênh này cho phép client và server gửi – nhận dữ liệu theo thời gian thực.
| **Sự kiện / Message** | **Phía gửi**    | **Input / Dữ liệu**  | **Phản hồi / Kết quả**                                                         |
| --------------------- | --------------- | -------------------- | ------------------------------------------------------------------------------ |
| `join`                | Client → Server | `{ id, name }`       | Server tạo người chơi mới và gửi danh sách người chơi hiện tại.                |
| `move`                | Client → Server | `{ id, dx, dy }`     | Server cập nhật vị trí người chơi và gửi lại trạng thái mới cho tất cả client. |
| `attack`              | Client → Server | `{ id, angle }`      | Server xử lý hành động tấn công, kiểm tra va chạm và broadcast kết quả.        |
| `stateUpdate`         | Server → Client | `{ players: [...] }` | Gửi dữ liệu đồng bộ toàn bộ người chơi trong game (60 lần/giây).               |
| `disconnect`          | Server → Client | `{ id }`             | Thông báo người chơi đã rời khỏi game.                                         |

> **Lưu ý:** Bổ sung các endpoint của nhóm vào bảng trên.

---

## 📦 CẤU TRÚC
<img width="254" height="140" alt="image" src="https://github.com/user-attachments/assets/4bcf5601-c3ca-4d0b-88d1-fd5619fe2d34" />



## 📝 GHI CHÚ

- Port mặc định: **3000**
- Có thể thay đổi trong file config
