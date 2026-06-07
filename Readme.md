# Chatty 💬🔐

A full-stack real-time **end-to-end encrypted chat application** built with **Spring Boot**, **React**, **WebSockets**, and **Web Crypto API**.

Chatty supports secure authentication, multi-device login, per-device encryption keys, real-time messaging, online presence, delivery/read receipts, typing indicators, and a modern responsive UI.

---

# 🚀 Features

## 🔐 Authentication & Security

* User registration and login
* JWT access-token authentication
* Refresh token support using HttpOnly cookies
* Device-aware login system
* Refresh tokens linked to devices
* Protected REST APIs
* Secured WebSocket connections
* Spring Security integration
* Stateless backend authentication
* Device fingerprint tracking
* Multi-browser / multi-device account support

---

## 🔒 End-to-End Encryption

Chatty uses client-side encryption. The backend never receives plaintext messages or private keys.

### Encryption Design

* Messages are encrypted in the browser before sending
* AES-GCM is used for message encryption
* RSA-OAEP is used to encrypt the AES key
* Every device has its own RSA key pair
* Private keys are stored locally in IndexedDB
* Public keys are stored on the backend per device
* Every message stores one encrypted AES key per target device

### E2EE Flow

```text
User types message
    ↓
Frontend generates one AES key
    ↓
Message is encrypted using AES-GCM
    ↓
AES key is encrypted separately for every sender + receiver device
    ↓
Backend stores only:
      ciphertext
      iv
      encrypted AES keys per device
```

---

## 📱 Multi-Device Support

Each login device/browser gets its own identity.

### Device Model

```text
Device
├── id
├── user
├── deviceName
├── deviceFingerprint
├── publicKey
├── createdAt
├── lastSeen
└── active
```

### Supported

* Same account on multiple browsers
* Same account on multiple devices
* Separate private key per device
* Device-specific encrypted AES keys
* Device removal / unlinking
* Refresh tokens tied to devices
* WebSocket sessions identified as:

```text
username:deviceId
```

Example:

```text
Fateen:1
Fateen:2
Fateen:3
```

---

## ⚠️ New Device Limitation

A completely new device cannot decrypt older messages automatically.

Why?

```text
Old messages were encrypted before the new device existed.
So those old messages do not contain AES keys encrypted for the new device.
```

Current behavior:

```text
Old messages → unavailable on new device
New messages → decrypt normally
```

Planned future solution:

```text
Trusted device key sync / key rewrapping
```

Where an existing trusted device decrypts old AES keys locally and re-encrypts them for the new device.

---

## 💬 Real-Time Messaging

* Real-time messaging using STOMP over WebSockets
* Bi-directional communication
* Message persistence in database
* Device-specific message delivery
* Recent chats sidebar
* Conversation history loading
* Duplicate message prevention
* Automatic sidebar refresh after new messages

---

## 🟢 Presence System

Tracks online/offline status in real time.

### Features

* Online user detection
* Real-time presence broadcasting
* Multi-device/session support
* Instant UI updates
* Normalized frontend username display

### Example

```text
Sania → Online now
Fateen → Offline
```

---

## ✍️ Typing Indicators

Typing status is sent over WebSocket.

### Flow

```text
User starts typing
    ↓
Frontend publishes typing=true
    ↓
Backend forwards event to receiver devices
    ↓
Receiver UI shows "Typing..."
    ↓
Frontend sends typing=false after timeout or message send
```

---

## ✅ Message Status System

Implemented real-time message lifecycle tracking.

### Supported Statuses

| Status    | Meaning                               |
| --------- | ------------------------------------- |
| SENT      | Message stored successfully           |
| DELIVERED | Receiver device received the message  |
| READ      | Receiver opened/read the conversation |

### UI Example

```text
✓        -> SENT
✓✓       -> DELIVERED
✓✓ Read  -> READ
```

### Real-Time Receipts

* Delivery acknowledgements
* Read receipts
* Live sender updates via WebSocket
* Receipt events sent to all active sender devices

---

## 🧠 Smart Frontend State Management

* Cached conversation state
* Optimized WebSocket message updates
* Duplicate message prevention
* Recent chat refresh event
* Auto-scroll on new messages
* Loading states for login/register/chat/sidebar
* Disabled send button during encryption/send
* Responsive mobile layout

---

## 🎨 Modern UI

* Responsive chat interface
* Dark mode support
* Clean message layout
* Sidebar recent chats
* Online indicators
* Typing indicators
* Loading spinners
* Tailwind CSS styling
* Mobile-friendly layout
* Custom app favicon/icon support

---

# 🛠️ Tech Stack

## Backend

* Java 21
* Spring Boot
* Spring Security
* Spring WebSocket
* STOMP Protocol
* JWT Authentication
* HttpOnly Refresh Token Cookies
* Spring Data JPA
* Hibernate
* Maven
* PostgreSQL / Supabase-compatible database

## Frontend

* React
* Vite
* Tailwind CSS
* Context API
* STOMP.js
* SockJS
* Lucide Icons
* Web Crypto API
* IndexedDB

---

# 📂 Project Structure

```text
/backend/ChatApplicationBackend/
│
├── config/
├── controller/
├── models/
│   ├── dto/
│   └── enums/
├── presence/
├── repository/
├── security/
├── services/
└── websocket/

/frontend/
│
├── components/
│   ├── ChatArea/
│   └── ...
├── pages/
├── hooks/
├── context/
├── crypto/
├── services/
└── assets/
```

---

# ⚙️ Getting Started

## Prerequisites

Install:

* Node.js 18+
* Java JDK 21+
* Maven
* PostgreSQL / Supabase database

---

# 🔧 Backend Setup

Navigate to backend:

```bash
cd backend/ChatApplicationBackend
```

Configure environment variables / properties:

```properties
JWT_SECRET=your-secret-key
spring.datasource.url=your-database-url
spring.datasource.username=your-db-username
spring.datasource.password=your-db-password
```

Run backend:

```bash
./mvnw spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

---

# 🎨 Frontend Setup

Navigate to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:8080
```

Run frontend:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# 🔌 WebSocket Architecture

Chatty uses:

```text
STOMP over WebSockets
```

---

## WebSocket Endpoint

```text
/ws
```

---

## WebSocket Principal Format

Each WebSocket session is identified as:

```text
username:deviceId
```

Example:

```text
Fateen:1
```

This allows the backend to deliver device-specific encrypted message payloads.

---

## Publish Destinations

| Destination           | Purpose                    |
| --------------------- | -------------------------- |
| `/app/chat`           | Send encrypted message     |
| `/app/chat.read`      | Mark messages as read      |
| `/app/chat.delivered` | Mark messages as delivered |
| `/app/chat.typing`    | Send typing status         |

---

## Subscribe Destinations

| Destination             | Purpose                         |
| ----------------------- | ------------------------------- |
| `/user/queue/messages`  | Receive encrypted chat messages |
| `/user/queue/read`      | Receive read receipts           |
| `/user/queue/delivered` | Receive delivery receipts       |
| `/user/queue/typing`    | Receive typing events           |
| `/topic/presence`       | Receive online/offline updates  |

---

# 📡 Presence Flow

```text
User connects through WebSocket
    ↓
JWT is validated
    ↓
Device-aware principal is created
    ↓
User/device marked ONLINE
    ↓
Presence event is broadcast
    ↓
Frontend updates online indicator
```

Disconnect flow:

```text
User/device disconnects
    ↓
Session count is updated
    ↓
If no active sessions remain:
        User marked OFFLINE
    ↓
Frontend receives presence update
```

---

# 📨 Encrypted Message Flow

```text
Sender writes message
    ↓
Frontend fetches sender devices
    ↓
Frontend fetches receiver devices
    ↓
Frontend generates AES key
    ↓
Message is encrypted using AES-GCM
    ↓
AES key is encrypted for every sender + receiver device
    ↓
Frontend sends ciphertext + iv + device keys
    ↓
Backend stores encrypted message
    ↓
Backend stores MessageDeviceKey rows
    ↓
Backend sends device-specific payloads over WebSocket
    ↓
Each device decrypts using its own private key
```

---

# 🗄️ Database Model

## User Entity

```text
User
├── id
├── username
├── email
└── password
```

---

## Device Entity

```text
Device
├── id
├── user_id
├── deviceName
├── deviceFingerprint
├── publicKey
├── createdAt
├── lastSeen
└── active
```

---

## Message Entity

```text
Message
├── id
├── sender_id
├── receiver_id
├── ciphertext
├── iv
├── status
└── createdAt
```

---

## MessageDeviceKey Entity

```text
MessageDeviceKey
├── id
├── message_id
├── device_id
└── encryptedAesKey
```

Unique rule:

```text
One encrypted AES key per message per device
```

```text
UNIQUE(message_id, device_id)
```

---

## RefreshToken Entity

```text
RefreshToken
├── id
├── token
├── username
├── expiryDate
├── revoked
├── familyId
└── device_id
```

---

# Message Status Enum

```java
public enum MessageStatus {
    SENT,
    DELIVERED,
    READ
}
```

---

# 📡 REST API Endpoints

## 🔐 Authentication

### Register

```http
POST /auth/register
```

Request:

```json
{
  "username": "Fateen",
  "email": "fateen@example.com",
  "password": "StrongPassword@123"
}
```

---

### Login

```http
POST /auth/login
```

Request:

```json
{
  "username": "Fateen",
  "password": "StrongPassword@123",
  "deviceName": "Chrome Browser",
  "deviceFingerprint": "device-uuid",
  "publicKey": "base64-public-key"
}
```

Response:

```json
{
  "accessToken": "jwt-access-token"
}
```

Refresh token is stored as an HttpOnly cookie.

---

### Refresh Token

```http
POST /auth/refresh
```

Returns a new access token.

---

### Logout

```http
POST /auth/logout
```

Revokes the current refresh token and clears the refresh cookie.

---

# 💬 Messages

All message endpoints require JWT authentication.

## Get Recent Chats

```http
GET /messages/recent-chats
```

Returns recent chats with encrypted message preview and the AES key encrypted for the current device.

---

## Get Conversation

```http
GET /messages/chat/{receiverId}
```

Returns encrypted messages and per-device encrypted AES keys for the current device.

---

# 👤 Users

## Current User Data

```http
GET /user-data
```

---

## Search User

```http
GET /receiver/search/{receiverUsername}
```

---

## Get User Devices

```http
GET /users/{username}/devices
```

Returns active devices and public keys.

Response:

```json
[
  {
    "deviceId": 1,
    "publicKey": "base64-public-key"
  },
  {
    "deviceId": 2,
    "publicKey": "base64-public-key"
  }
]
```

---

# 📱 Devices

## Get Current Device

```http
GET /devices/current
```

---

## Get My Devices

```http
GET /devices/me
```

---

## Remove Device

```http
DELETE /devices/{id}
```

Marks a device inactive and revokes refresh tokens linked to it.

---

# 🔒 Security Model

* Backend never stores plaintext messages
* Backend never stores private keys
* Backend only stores public device keys
* Each device has its own private key
* Each message has one encrypted AES key per device
* Removed devices stop receiving future message keys
* JWT includes `deviceId`
* WebSocket sessions are authenticated
* Refresh tokens are rotated and revocable
* Refresh tokens are tied to devices

---

# 🧠 Concepts Implemented

This project includes practical implementations of:

* Real-time WebSockets
* STOMP protocol
* JWT authentication
* HttpOnly refresh-token cookies
* Device-based authentication
* Multi-device E2EE
* AES-GCM encryption
* RSA-OAEP key wrapping
* IndexedDB private-key storage
* Presence systems
* Delivery/read receipts
* Typing indicators
* React state synchronization
* Event-driven architecture
* Spring Security
* JPA entity relationships
* WebSocket user queues
* Device-specific message routing

---

# 🚧 Planned Features

* Trusted-device history sync for new devices
* Message pagination
* Unread message counts
* File/image sharing
* Group chats
* Push notifications
* Redis-backed presence
* Docker deployment
* CI/CD pipeline
* Better device management UI
* Encrypted backup/recovery flow

---

# ⚠️ Current Limitation

Newly added devices cannot decrypt old messages unless old message keys are rewrapped for that device.

This is expected in real E2EE systems.

Future solution:

```text
Existing trusted device approves new device
    ↓
Existing device decrypts old AES keys locally
    ↓
Existing device encrypts AES keys for new device public key
    ↓
Backend stores new MessageDeviceKey rows
    ↓
New device can decrypt old history
```

---

# 📜 License

This project is licensed under the MIT License.
