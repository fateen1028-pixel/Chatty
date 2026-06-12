# Chatty 💬🔐

A full-stack real-time **end-to-end encrypted chat application** built with **Spring Boot**, **React**, **WebSockets**, and the **Web Crypto API**.

Chatty supports secure authentication, device-aware login, multi-device encrypted messaging, encrypted recovery backup, trusted-device approval, online presence, delivery/read receipts, typing indicators, and a modern responsive UI.

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
* Device removal / unlinking
* Refresh token revocation per device

---

## 🔒 End-to-End Encryption

Chatty uses client-side encryption. The backend never receives plaintext messages or private keys.

### Encryption Design

* Messages are encrypted in the browser before sending
* AES-GCM is used for message encryption
* RSA-OAEP is used to encrypt AES keys
* Each device/login has a device identity
* Private keys are stored locally in IndexedDB
* Public keys are stored on the backend per device
* Every message stores encrypted AES keys for sender and receiver devices
* Backend stores only ciphertext, IV, and encrypted AES keys

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
Backend stores:
      ciphertext
      iv
      encrypted AES keys per device
    ↓
Each device decrypts using its local private key
```

---

# 📱 Multi-Device Support

Each login device/browser gets its own device record.

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
* Device-specific encrypted AES keys
* Device-specific WebSocket delivery
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

# 🔑 New Device Access

A new device cannot read old encrypted messages just because the user logged in.

Why?

```text
Old messages were encrypted before the new device existed.
So those old messages may not contain AES keys directly encrypted for the new device ID.
```

Chatty solves this using two recovery paths:

```text
1. Trusted-device approval
2. Recovery phrase backup
```

---

## ✅ Trusted-Device Approval

Use this when the user still has an old trusted device where chats are readable.

### Flow

```text
New device logs in
    ↓
New device creates a temporary RSA key pair
    ↓
New device creates an approval request
    ↓
New device shows a 6-digit verification code
    ↓
Old trusted device sees the pending request
    ↓
User checks that the code matches on both devices
    ↓
Old trusted device encrypts the chat access key package
    ↓
Backend stores only the encrypted approval package
    ↓
New device downloads the encrypted package
    ↓
New device decrypts it locally
    ↓
New device restores chat access
```

### Important Security Rule

The backend never receives plaintext private keys.

Trusted-device approval uses hybrid encryption:

```text
Exported private key
    ↓
Encrypted with temporary AES-GCM key
    ↓
Temporary AES key encrypted using new device temporary RSA public key
    ↓
Encrypted package sent through backend
```

---

## 🧰 Recovery Phrase Backup

Use this when the old trusted device is lost.

### Flow

```text
Trusted device creates recovery phrase
    ↓
Private key is encrypted locally using AES-GCM
    ↓
AES key is derived from the recovery phrase using PBKDF2
    ↓
Only encrypted backup is uploaded
    ↓
Recovery phrase is never sent to backend
```

### Recovery Flow

```text
User logs in on new device
    ↓
User enters recovery phrase locally
    ↓
Frontend downloads encrypted backup
    ↓
Private key is decrypted locally
    ↓
Private key is saved in IndexedDB
    ↓
Current device public key is updated
    ↓
Old chats become readable again
```

### Failure Rule

```text
No trusted device + no recovery phrase = old encrypted messages cannot be restored
```

This is expected behavior in end-to-end encrypted systems.

---

# 🧠 Device Trust Detection

The frontend does not mark a device trusted just because a local key exists.

A new browser can generate a fresh key pair during login, but that does not mean it can read old chats.

So Chatty verifies device access by checking whether the current local private key can decrypt recent chat AES keys.

### Trust Check

```text
Check local private key
    ↓
Fetch recent chats
    ↓
Fetch recent conversation keys
    ↓
Try decrypting encrypted AES keys locally
    ↓
If decrypt succeeds → trusted device
If decrypt fails → device needs recovery/approval
```

---

# 💬 Real-Time Messaging

* Real-time messaging using STOMP over WebSockets
* Bi-directional communication
* Message persistence in database
* Device-specific message delivery
* Recent chats sidebar
* Conversation history loading
* Duplicate message prevention
* Automatic sidebar refresh after new messages
* Encrypted message payloads sent per device

---

# 🟢 Presence System

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

# ✍️ Typing Indicators

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

# ✅ Message Status System

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

# 🧠 Smart Frontend State Management

* Cached conversation state
* Optimized WebSocket message updates
* Duplicate message prevention
* Recent chat refresh event
* Auto-scroll on new messages
* Loading states for login/register/chat/sidebar
* Disabled send button during encryption/send
* Responsive mobile layout
* Encrypted chat access page with guided recovery flow

---

# 🎨 Modern UI

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
* Guided encrypted-access UI
* Recovery and approval flows designed around user problems, not developer terminology

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
* STOMP.js
* SockJS
* Lucide Icons
* Web Crypto API
* IndexedDB
* LocalStorage for non-secret device metadata

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

Build frontend:

```bash
npm run build
```

---

# 🔌 WebSocket Architecture

Chatty uses:

```text
STOMP over WebSockets
```

## WebSocket Endpoint

```text
/ws
```

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

# 📡 WebSocket Destinations

## Publish Destinations

| Destination           | Purpose                    |
| --------------------- | -------------------------- |
| `/app/chat`           | Send encrypted message     |
| `/app/chat.read`      | Mark messages as read      |
| `/app/chat.delivered` | Mark messages as delivered |
| `/app/chat.typing`    | Send typing status         |

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

## KeyBackup Entity

Stores encrypted recovery backup.

```text
KeyBackup
├── id
├── user_id
├── version
├── algorithm
├── kdf
├── hash
├── iterations
├── salt
├── iv
├── encryptedPrivateKey
├── publicKey
├── createdAt
└── updatedAt
```

Important:

```text
The recovery phrase is never stored.
The raw private key is never stored.
Only encryptedPrivateKey is stored.
```

---

## DeviceApproval Entity

Stores temporary encrypted approval flow data.

```text
DeviceApproval
├── id
├── user_id
├── new_device_id
├── verificationCode
├── tempPublicKey
├── encryptedPrivateKey
├── encryptedAesKey
├── iv
├── accountPublicKey
├── status
├── createdAt
├── expiresAt
└── approvedAt
```

Supported statuses:

```text
PENDING
APPROVED
REJECTED
EXPIRED
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

All protected endpoints require JWT authentication.

---

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

Returns encrypted messages and encrypted AES keys for the current device.

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

## Update Current Device Public Key

```http
PUT /devices/current/public-key
```

Used after recovery or trusted-device approval.

Request:

```json
{
  "publicKey": "restored-account-public-key"
}
```

---

## Remove Device

```http
DELETE /devices/{id}
```

Marks a device inactive and revokes refresh tokens linked to it.

---

# 🧰 Recovery Backup API

## Get Backup Status

```http
GET /key-backup/status
```

Response:

```json
{
  "enabled": true,
  "lastUpdated": "2026-06-12T10:00:00Z"
}
```

---

## Save Encrypted Backup

```http
POST /key-backup
```

Request:

```json
{
  "version": 1,
  "algorithm": "AES-GCM",
  "kdf": "PBKDF2",
  "hash": "SHA-256",
  "iterations": 310000,
  "salt": "base64-salt",
  "iv": "base64-iv",
  "encryptedPrivateKey": "base64-encrypted-private-key",
  "publicKey": "base64-public-key",
  "createdAt": "2026-06-12T10:00:00Z"
}
```

---

## Get Encrypted Backup

```http
GET /key-backup
```

Returns encrypted backup data.

The backend does not return or store the recovery phrase.

---

# 📲 Device Approval API

## Create Approval Request

Used from the new device.

```http
POST /device-approvals/request
```

Request:

```json
{
  "tempPublicKey": "base64-temporary-public-key"
}
```

Response:

```json
{
  "approvalId": 1,
  "verificationCode": "483921",
  "status": "PENDING",
  "expiresAt": "2026-06-12T10:05:00Z"
}
```

---

## Get Pending Requests

Used from a trusted device.

```http
GET /device-approvals/pending
```

Response:

```json
[
  {
    "approvalId": 1,
    "newDeviceId": 5,
    "deviceName": "Firefox Browser",
    "verificationCode": "483921",
    "tempPublicKey": "base64-temporary-public-key",
    "createdAt": "2026-06-12T10:00:00Z",
    "expiresAt": "2026-06-12T10:05:00Z"
  }
]
```

---

## Approve Device

Used from a trusted device.

```http
POST /device-approvals/{approvalId}/approve
```

Request:

```json
{
  "encryptedPrivateKey": "base64-encrypted-private-key",
  "encryptedAesKey": "base64-rsa-encrypted-aes-key",
  "iv": "base64-iv",
  "accountPublicKey": "base64-account-public-key"
}
```

---

## Reject Device

```http
POST /device-approvals/{approvalId}/reject
```

---

## Get Current Device Approval Result

Used from the new device.

```http
GET /device-approvals/current/result
```

Response when approved:

```json
{
  "approvalId": 1,
  "status": "APPROVED",
  "encryptedPrivateKey": "base64-encrypted-private-key",
  "encryptedAesKey": "base64-rsa-encrypted-aes-key",
  "iv": "base64-iv",
  "accountPublicKey": "base64-account-public-key",
  "expiresAt": "2026-06-12T10:05:00Z",
  "approvedAt": "2026-06-12T10:02:00Z"
}
```

---

# 🔒 Security Model

* Backend never stores plaintext messages
* Backend never receives plaintext private keys
* Backend never receives recovery phrases
* Backend only stores public keys and encrypted blobs
* Private keys are stored locally in IndexedDB
* Each message has one encrypted AES key per target device
* Removed devices stop receiving future message keys
* JWT includes `deviceId`
* WebSocket sessions are authenticated
* Refresh tokens are rotated and revocable
* Refresh tokens are tied to devices
* Device approval uses verification codes
* Recovery phrase uses PBKDF2 + AES-GCM
* Message encryption uses AES-GCM
* Key wrapping uses RSA-OAEP

---

# 🧪 Stress-Tested Scenarios

## Trusted Device + Backup Disabled

Expected:

```text
Device status: Trusted
Recommended action: Enable recovery phrase
```

---

## Trusted Device + Backup Enabled

Expected:

```text
Device status: Trusted
Recovery phrase: Enabled
No action needed
```

---

## Trusted Device + Pending Approval Request

Expected:

```text
Device status: Trusted
Device approval menu opens
Pending request shown
User must compare verification code
```

---

## New Device Before Recovery

Expected:

```text
Device status: Needs chat access
Recover chats menu opens
User chooses trusted-device approval or recovery phrase
```

---

## New Device + Old Trusted Device Available

Expected:

```text
User starts approval request
New device shows verification code
Trusted device approves matching code
New device restores chat access
```

---

## New Device + Old Device Lost + Recovery Phrase Available

Expected:

```text
User enters recovery phrase
Private key is restored locally
Current device public key is updated
Old chats become readable
```

---

## New Device + No Trusted Device + No Recovery Phrase

Expected:

```text
Recovery is impossible
Old encrypted messages stay locked
```

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
* Encrypted recovery backup
* PBKDF2 recovery phrase encryption
* Trusted-device approval
* Device verification codes
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

* Message pagination
* Unread message counts
* File/image sharing
* Group chats
* Push notifications
* Redis-backed presence
* Docker deployment
* CI/CD pipeline
* Better device management UI
* Expired approval cleanup job
* Automatic approval polling
* Stronger audit logs for device approval
* Optional passkey-based device trust

---

# ⚠️ Current Notes

Chatty currently supports restoring old chat access through:

```text
1. Trusted-device approval
2. Recovery phrase backup
```

Without either of those, old encrypted messages cannot be restored.

This is intentional and consistent with end-to-end encryption.

---

# 📜 License

This project is licensed under the MIT License.
