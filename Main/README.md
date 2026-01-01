## ["Game Online Focus → Advanced WebSocket game implementation ((Showcase kĩ thuật WebSocket với binary protocol qua game online)"]

---

##  THÔNG TIN NHÓM

| STT | Họ và Tên | MSSV | Email | Đóng góp |
|-----|-----------|------|-------|----------|
| 1 | Nguyễn Nhật Hưng| B22DCDT148 | nhathung19112004@gmail.com | Quản lí/Giao diện/Chat (Global & Phòng)/ Xử lí đồng bộ dữ liệu (Interpolation phía Guest)  |
| 2 | Trần Đức Anh| B22DCAT134 | ducduc7e@gmail.com | Tạo server/Thiết kế cơ chế game/Tạo phòng chơi/ Xây dựng Signaling Server (Node.js)/Logic sảnh/ Gom các hàm, biến, trạng thái từ server về client |
| 3 | Vũ Minh Đức | B22DCVT164 | ducvm2004@gmail.com | Thiết kế cơ chế game/Tạo phòng chờ, phòng chơi/ Logic phòng (Room Signaling)/Xây dựng Host Logic (Game Loop P2P)/ Tạo hàm xử lí, tương tác mới (P2P)|

---

 MÔ TẢ HỆ THỐNG

Hệ thống Gamin  Arena được xây dựng theo kiến trúc Peer-to-Peer (P2P) với mô hình Host-Guest. Hệ thống sử dụng WebSocket cho việc Signaling (mai mối) và WebRTC Data Channels để truyền tải dữ liệu game thời gian thực.

Mô hình này chia hệ thống làm 2 phần:

1. Phía Server (Node.js): Được triển khai bằng Node.js, Express và thư viện ws. Server này KHÔNG xử lý logic game, mà đóng vai trò là:

Web Server: Cung cấp (host) các file index.html, client.js... cho người chơi.

Signaling Server (Máy chủ mai mối):

Quản lý sảnh (lobby) và danh sách phòng (lobby.js).

Xử lý việc tạo phòng, vào phòng, kiểm tra mật khẩu.

Chỉ định người chơi đầu tiên làm Host.

Chuyển tiếp (Relay) các tin nhắn "bắt tay" WebRTC (offer, answer, candidate) giữa Host và các Guest.

Broadcast các lệnh điều khiển phòng (do Host gửi) như game_start, game_end.

2. Phía Client (Trình duyệt): Được phát triển bằng JavaScript (ES Modules) và Canvas API. Client có hai vai trò:

Client (Host):

Đây chính là "server" của trận đấu. Toàn bộ logic game (hostLogic.js) chạy trên trình duyệt của Host.

Chạy Game Loop 60 lần/giây (setInterval trong startHostGameLogic).

Xử lý input (phím bấm) của chính mình và của tất cả Guest (nhận qua WebRTC).

Tính toán vật lý, va chạm, trừ máu (lineCircleIntersect).

Nén trạng thái game (vị trí, HP...) thành gói nhị phân (Snapshot) và gửi trực tiếp cho tất cả Guest qua WebRTC Data Channels.

Client (Guest):

Gửi input (phím bấm W/A/S/D) (Gói 1) trực tiếp đến Host qua WebRTC Data Channel.

Nhận Snapshot (Gói 2) trực tiếp từ Host qua WebRTC Data Channel.

Không tự chạy logic game. Chỉ nhận "sự thật" (snapshot) từ Host.

Thực hiện Nội suy (Entity Interpolation): Lưu các snapshot vào historyBuffer và render trạng thái game trễ lại 100ms (INTERP_DELAY) để đảm bảo hình ảnh mượt mà, không bị giật lag.
**Cấu trúc logic tổng quát:**
1.Giai đoạn Mai mối (Signaling):
```
Client (Host) 
    ⇅ WebSocket (offer/answer)
Signaling Server (Node.js) 
    ⇅ WebSocket (offer/answer)
Client (Guest)
```
2.Giai đoạn Chơi game (Data):
```
Client (Guest) 
    ⇆ ⇆ ⇆ WebRTC Data Channel (Input / Snapshot) ⇆ ⇆ ⇆
Client (Host)
```

## ⚙️ CÔNG NGHỆ SỬ DỤNG

> Liệt kê công nghệ, framework, thư viện chính mà nhóm sử dụng.

| Thành phần | Công nghệ | Ghi chú |
|------------|-----------|---------|
| Server (Signaling) | Node.js + Express + WebSocket (thư viện ws) | Signaling Server, quản lý phòng/sảnh, chuyển tiếp WebRTC |
| Client (Logic) | JavaScript (ES Modules) + Canvas API | Chạy logic game (Host) và render đồ họa (Guest) |
| Giao tiếp (Signaling) | WebSocket | Dùng cho Signaling (mai mối P2P) và Chat (Global/Room) |
| Giao tiếp (Game Data) | WebRTC (Data Channels) | Truyền dữ liệu game (Input/Snapshot) trực tiếp giữa Host và Guest |
| Render đồ họa | HTML5 Canvas | Vẽ bản đồ, nhân vật, thanh kiếm, thanh máu. |
| Cấu hình P2P | STUN Server (stun:stun.l.google.com:19302) | Giúp các client tìm thấy địa chỉ IP thật của nhau (NAT Traversal) |
| Công cụ hỗ trợ | Apache NetBean, Browser F12 tool| Phát triển, quản lý gói và debug P2P/WebSocket.|

---

##  HƯỚNG DẪN CHẠY DỰ ÁN

### 1. Clone repository
```bash
git clone <repository-url>
cd assignment-network-project
```

### 2. Chạy project (NetBen)
Trên cửa số hierachy:
<img width="446" height="243" alt="image" src="https://github.com/user-attachments/assets/ede6672b-3efd-49c5-b98f-d0c299c9daff" />

### 3. Chơi/ mời
<img width="800" height="277" alt="image" src="https://github.com/user-attachments/assets/af4958a4-49ec-4bdb-9e9a-94e4c578d202" />

Sử dụng đường link được đưa ra để chơi game/ mời bạn bè


## 🔗 GIAO TIẾP (GIAO THỨC SỬ DỤNG)
1. Kênh Signaling (Client ↔ Server (Node.js) qua WebSocket)

| Loại gói tin | Giao thức | Hướng truyền | Input | Output | Mô tả |
|----------|----------|--------|-------|--------|--------|
| Tạo phòng | WebSocket | Client → Server | {"type": "create_room", "name": "Room1"} | {"type": "created", "room": {"id": "abc"}} | Client yêu cầu tạo phòng. Server trả về ID phòng. |
| Xin vào phòng | WebSocket | Client → Server | {"type": "join_request", "id": "abc", "pass": "123"} | {"type": "join_ok", "room": {"id": "abc"}} | Client xin tham gia phòng (kèm pass). Server cho phép. |
| Cấp ID | WebSocket | Server → Client |  | [Binary: 0, <player_id>] | (Gói 0) Server cấp myId duy nhất cho client khi vào /room/:id. |
| Cập nhật phòng | WebSocket | Server →  Clients |  | {"type": "lobby_update", "players": [...], "hostId": 1} | Gói quan trọng: Server báo ai là Host và danh sách người chơi mới. |
| P2P Offer | WebSocket | Guest → Server| {"type": "webrtc_offer", "offer": {...}} | (Chuyển tiếp tới Host) | Guest gửi "lời mời P2P" (offer) cho Host. Server chỉ chuyển tiếp. |
| P2P Answer | WebSocket | Client → Server | {"type": "webrtc_answer", "targetId": 2, ...} | (Chuyển tiếp tới Guest) | Host "chấp nhận P2P" (answer) và gửi lại. Server chỉ chuyển tiếp. |
| P2P Candidate | WebSocket | Client ⇅ Server | {"type": "webrtc_candidate", "targetId": 2, ...} | (Chuyển tiếp 2 phía) | Host và Guest trao đổi "chỉ đường" (ICE candidate) qua Server. |
| Bắt đầu game | WebSocket | Client → Server | {"type": "start_game"} | (Server broadcast game_start) | Host ra lệnh cho Server: "Hãy broadcast cho mọi người là game bắt đầu". |
| Chat (Room) | WebSocket | Client → Server | {"type": "chat_room", "message": "Hi"} | (Server broadcast chat_room_msg) | Chat trong phòng (vẫn đi qua server). |
| Ping/Pong | WebSocket | Client ⇅ Server | [Binary: 4] (Ping) | [Binary: 5] (Pong) | (Gói 4, 5) Đo độ trễ của kênh Signaling, không phải độ trễ game. |
| Thoát phòng | WebSocket | Client → Server | (Client ngắt kết nối) | (Server gửi lobby_update mới) |Client mất kết nối (ws.on('close')). Server cập nhật phòng (chọn Host mới nếu cần). |

2. Kênh Game Data (Guest ↔ Host qua WebRTC Data Channel)

| Loại gói tin | Giao thức | Hướng truyền | Input | Output | Mô tả |
|----------|----------|--------|-------|--------|--------|
| Gói 1 (Input) | WebRTC | Guest → Host | [1, <inputSeq>, <flags>] | Gói nhị phân chứa phím bấm (W/A/S/D) của Guest. |
| Gói 2 (Input) | WebRTC | Host → Guest |  | [2, <tick>, <state>, <n>, ...data...] | Gói nhị phân chứa toàn bộ trạng thái game do Host tính toán. |
| Gói 3 (Input) | WebRTC | Guest → Host | [3] | (Server broadcast chat_room_msg) | Guest gửi yêu cầu hồi sinh trực tiếp cho Host xử lý. |

---

##  KẾT QUẢ THỰC NGHIỆM
<img width="2555" height="1395" alt="image" src="https://github.com/user-attachments/assets/c5650303-7d23-4795-836d-7f1fa663dc74" />

1.Màn hình bắt đầu

<img width="2556" height="1407" alt="image" src="https://github.com/user-attachments/assets/4015367a-24da-4bb0-9d60-b3d638afc233" />

2. Trang chủ (Khi ấn nút tạo phòng)

<img width="2557" height="1408" alt="image" src="https://github.com/user-attachments/assets/d9251950-eae4-458c-90d2-68ed48b397c3" />

3. Trang chủ (Khi ấn nút vào phòng)

<img width="2558" height="1391" alt="image" src="https://github.com/user-attachments/assets/051cc31b-9b2a-4cb7-8481-80fbd13aaec8" />

4. Phòng chờ

<img width="2556" height="1409" alt="image" src="https://github.com/user-attachments/assets/f85f0a22-370f-41d9-a8fb-68b5f962e995" />

5. Phòng chơi





---
              


---

## 🧩 HƯỚNG PHÁT TRIỂN THÊM

1. Tối ưu hóa P2P và Trải nghiệm mạng:

Client-Side Prediction (Dự đoán phía Client): Giúp Guest thấy hành động của mình ngay lập tức (không cần chờ Host) để giảm độ trễ input.

Host Migration (Chuyển Host): Nếu Host bị ngắt kết nối, tự động bầu chọn một Guest khác làm Host mới để trận đấu không bị gián đoạn.

2. Bảng xếp hạng (Leaderboard): Hiển thị bảng xếp hạng thành tích người chơi.

3.Tích hợp hệ thống đăng nhập & lưu dữ liệu người chơi: Thêm đăng nhập, lưu K/D, số trận thắng. (Sử dụng MongoDB hoặc PostgreSQL).

4. Tích hợp voice chat

5. Cải thiện đồ họa và hiệu ứng


## 📝 GHI CHÚ

- Repo tuân thủ đúng cấu trúc đã hướng dẫn trong `INSTRUCTION.md`.
- Đảm bảo test kỹ trước khi submit.

---

## 📚 TÀI LIỆU THAM KHẢO

High Performance Browser Networking (https://hpbn.co/)

WebSocket API (https://hpbn.co/websocket/#websocket-api)

WebSocket Protocol (https://hpbn.co/websocket/#websocket-protocol)

RTC: 

https://www.makeuseof.com/tag/webrtc-explained-api-changing-internet/

https://viblo.asia/p/webrtc-phan-1-E375zEPdlGW

https://tinhte.vn/thread/tim-hieu-ve-webrtc-chuan-web-giup-goi-dien-video-choi-game-tu-trinh-duyet-ma-khong-can-cai-gi-them.2464886/

