# MODULE CLIENT

> 📘 *Sinh viên mô tả phần **client** tại đây. Điền đầy đủ theo framework và bài toán của nhóm.*

---

## 🎯 MỤC TIÊU

Client chịu trách nhiệm:
- Gửi yêu cầu đến server
- Hiển thị kết quả cho người dùng
- Cung cấp giao diện tương tác

---

## ⚙️ CÔNG NGHỆ SỬ DỤNG

| Thành phần           | Công nghệ                                          |
|----------------------|----------------------------------------------------|
| Ngôn ngữ             | JavaScript (ES6)                                   |
| Thư viện chính       | WebSocket API, HTML Canvas API, DOM API            |
| Giao thức            | WebSocket                                          |
| Xử lý dữ liệu        | ArrayBuffer, DataView                              |
| Vẽ và hiển thị       | HTML5 Canvas (2D Context), requestAnimationFrame() |
| Tương tác người dùng | Keyboard Events (keydown, keyup) |
| Giao diện / UI       | HTML + CSS + JavaScript |

---

## 🚀 HƯỚNG DẪN CHẠY

### 1. Clone repository
```bash
git clone <repository-url>
cd assignment-network-project
```

### 2. Chạy project (NetBen)
Trên cửa số hierachy:
<img width="446" height="243" alt="image" src="https://github.com/user-attachments/assets/ede6672b-3efd-49c5-b98f-d0c299c9daff" />

---

## 📦 CẤU TRÚC
```
gamin/
└── client/
    ├── README.md
    ├── chat.js
    ├── client.js
    ├── constants.js
    ├── gameClient.js
    ├── hostLogic.js
    ├── index.html
    ├── lobby.js
    ├── main.js
    ├── room.js
    ├── state.js
    ├── sword.png
    ├── ui.js
    └── utils.js

```

---

## 💡 SỬ DỤNG
```bash
📘 Hướng Dẫn Sử Dụng (Client)
1. Đăng Nhập & Sảnh Chờ (Lobby)
Bước 1: Nhập tên hiển thị (Nickname) của bạn vào ô trống và nhấn nút Enter (hoặc nút Mũi tên) để kết nối tới máy chủ.

Bước 2: Tại màn hình Sảnh chờ (Lobby), bạn có thể:

Chat Global: Trò chuyện với tất cả người chơi đang online.

Tạo phòng: Nhấn nút "Tạo phòng", đặt tên phòng và mật khẩu (nếu muốn chơi riêng tư).

Tham gia: Nhấn vào tên phòng trong danh sách để tham gia. Nếu phòng có khóa (🔒), bạn cần nhập đúng mật khẩu.

2. Trong Phòng Chờ (Room)
Chat Room: Khi đã vào phòng, hệ thống chat sẽ tự động chuyển sang tab Room. Tin nhắn lúc này chỉ hiển thị cho những người trong cùng phòng.

Vai trò:

Chủ phòng (Host): Có quyền nhấn nút "Bắt đầu" để vào game hoặc hủy đếm ngược.

Người chơi (Guest): Chờ chủ phòng bắt đầu game.

3. Điều Khiển & Lối Chơi (Gameplay)
Khi trận đấu bắt đầu (trạng thái IN_PROGRESS), sử dụng bàn phím để điều khiển nhân vật:
Phím điều khiển: WASD

⚔️ Cơ Chế Chiến Đấu
Tấn công: Nhân vật sẽ có một quả cầu (thanh kiếm) xoay quanh người. Việc xoay này là tự động.
Gây sát thương: Điều khiển nhân vật sao cho kiếm của bạn chạm vào người đối thủ.
Đỡ đòn (Clash): Nếu kiếm của bạn chạm vào kiếm của đối thủ, cả hai sẽ bị nảy ra và kiếm đổi chiều xoay.
Máu (HP): Mỗi người chơi có 100 HP. Khi bị đánh trúng sẽ mất máu.
Hồi sinh: Khi HP về 0, bạn sẽ bị loại. Nút "HỒI SINH" sẽ xuất hiện sau 2 giây. Nhấn vào để quay lại trò chơi.

4. Lưu Ý Quan Trọng
Kết nối P2P: Game sử dụng công nghệ WebRTC (Peer-to-Peer). Dữ liệu di chuyển được gửi trực tiếp giữa các người chơi để giảm độ trễ. Nếu không thấy người chơi khác di chuyển, hãy kiểm tra lại kết nối mạng hoặc tường lửa.
Thoát phòng: Bạn có thể nhấn nút "Rời phòng" bất cứ lúc nào để quay lại Sảnh chờ.
```
Cách thức hoạt động
```bash
host và client sẽ gửi signaling qua webSocket thông qua server để nhận được các thông tin cơ bản --> tạo quan hệ bắt táy
phòng mà host tạo ra tạo một kênh đế kết nối giữa host và client, lúc này host đóng vai trò như một server thứ 2, client chi gửi các snapshot về
còn host gửi trạng thái của phòng cho client thông qua kết nối P2P
---




