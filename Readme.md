# Real-Time Chat Application 💬

A full-stack real-time chat application built using **Spring Boot**, **WebSockets**, and **React**.  
The system supports secure JWT authentication, live messaging, online presence tracking, message delivery/read receipts, and a modern responsive UI.

---

# 🚀 Features

## 🔐 Authentication & Security

- User Registration & Login
- JWT-based authentication
- Protected REST APIs
- Secured WebSocket connections
- Spring Security integration
- Stateless backend authentication

---

## 💬 Real-Time Messaging

- Instant messaging using STOMP over WebSockets
- Bi-directional communication
- Real-time conversation updates
- Message persistence in database
- Recent chats sidebar
- Conversation history loading

---

## 🟢 Presence System

Tracks user online/offline status in real-time.

### Features

- Online user detection
- Real-time presence broadcasting
- Multi-tab/session support
- Instant UI updates for online users

### Example

```text
John → Online now
Alex → Offline
```

---

## ✅ Message Status System

Implemented full real-time message lifecycle tracking.

### Supported Statuses

| Status | Meaning |
|---|---|
| SENT | Message stored successfully |
| DELIVERED | Receiver received the message |
| READ | Receiver opened/read the message |

### UI Example

```text
✓        -> SENT
✓✓       -> DELIVERED
✓✓ Read  -> READ
```

### Real-Time Receipts

- Delivery acknowledgements
- Read receipts
- Live sender updates via WebSocket

---

## 🧠 Smart Frontend State Management

- Cached conversation state
- Optimized WebSocket updates
- Duplicate message prevention
- Real-time sidebar refresh
- Auto-scroll behavior
- Responsive mobile layout

---

## 🎨 Modern UI

- Responsive chat interface
- Dark mode support
- Clean messaging layout
- Online indicators
- Modern Tailwind styling
- Mobile-friendly design

---

# 🛠️ Tech Stack

---

## Backend

- Java 21
- Spring Boot
- Spring Security
- Spring WebSocket
- STOMP Protocol
- JWT Authentication
- Spring Data JPA
- Hibernate
- Maven

---

## Frontend

- React
- Vite
- Tailwind CSS
- Context API
- STOMP.js
- SockJS
- Lucide Icons

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
├── pages/
├── context/
├── services/
└── assets/
```

---

# ⚙️ Getting Started

---

# Prerequisites

Install:

- Node.js v16+
- Java JDK 21+
- Maven
- MySQL/PostgreSQL (depending on your configuration)

---

# 🔧 Backend Setup

Navigate to backend:

```bash
cd backend/ChatApplicationBackend
```

Configure:

```properties
src/main/resources/application.properties
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

The application uses:

```text
STOMP over WebSockets
```

for real-time communication.

---

# WebSocket Endpoint

```text
/ws
```

---

# Publish Destinations

| Destination | Purpose |
|---|---|
| `/app/chat` | Send new message |
| `/app/chat.read` | Mark messages as read |
| `/app/chat.delivered` | Mark messages as delivered |

---

# Subscribe Destinations

| Destination | Purpose |
|---|---|
| `/user/queue/messages` | Receive chat messages |
| `/user/queue/read` | Receive read receipts |
| `/user/queue/delivered` | Receive delivery receipts |
| `/topic/presence` | Presence updates |

---

# 📡 Presence System Flow

```text
User connects
    ↓
WebSocket authenticated
    ↓
User marked ONLINE
    ↓
Presence broadcast sent
    ↓
Frontend updates UI
```

Disconnect flow:

```text
User disconnects
    ↓
Session count decremented
    ↓
If no active sessions:
    User marked OFFLINE
```

---

# 📨 Message Flow

```text
Sender sends message
    ↓
Backend stores message
    ↓
Status = SENT
    ↓
Receiver gets message via WebSocket
    ↓
Receiver sends DELIVERED acknowledgement
    ↓
Status = DELIVERED
    ↓
Receiver opens chat
    ↓
Receiver sends READ acknowledgement
    ↓
Status = READ
```

---

# 🗄️ Database Model

## Message Entity

```text
Message
├── id
├── sender
├── receiver
├── messageText
├── status
└── createdAt
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

---

# 🔐 Authentication

## Register

```http
POST /auth/register
```

## Login

```http
POST /auth/login
```

Returns JWT token.

---

# 💬 Messages

All endpoints require JWT authentication.

## Get Recent Chats

```http
GET /messages/recent-chats
```

## Get Conversation

```http
GET /messages/chat/{receiverId}
```

## Send HTTP Message

```http
POST /messages/{receiverId}
```

---

# 👤 Users

## Current User Data

```http
GET /user-data
```

## Search User

```http
GET /receiver/search/{receiverUsername}
```

---

# 🔒 Security

- JWT-secured APIs
- Stateless authentication
- Protected WebSocket handshake
- Custom JWT WebSocket interceptor
- Spring Security filter chain
- User-specific message queues

---

# 🧠 Concepts Implemented

This project includes practical implementations of:

- WebSockets
- STOMP Protocol
- Real-time communication
- JWT authentication
- Stateful frontend synchronization
- Presence systems
- Read receipts
- Delivery acknowledgements
- Session tracking
- Event-driven architecture
- Concurrent collections
- React state optimization

---

# 🚧 Planned Features

- Typing indicators
- Unread message counts
- File/image sharing
- Message pagination
- Group chats
- Push notifications
- Redis caching
- Docker deployment
- Kubernetes deployment
- End-to-end encryption

---

# 📜 License

This project is licensed under the MIT License.