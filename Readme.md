# Real-Time Chat Application

A full-stack real-time chat application featuring user authentication, real-time messaging using WebSockets, and a modern responsive frontend.

## 🚀 Features

- **User Authentication**: Secure Login & Registration using JWT (JSON Web Tokens).
- **Real-Time Messaging**: Instant message delivery using WebSockets.
- **Chat History**: Persists and displays previous conversations with users.
- **Modern UI**: Intuitive and responsive chat interface built with React.
- **Theming**: Support for custom theming (Dark/Light mode).

## 🛠️ Tech Stack

### Backend
- **Java & Spring Boot**: Core backend framework.
- **Spring Security & JWT**: For securing endpoints and user authentication.
- **Spring WebSockets**: For real-time bi-directional communication.
- **Maven**: Dependency management.

### Frontend
- **React**: UI library.
- **Vite**: Fast frontend build tool.
- **Context API**: State management (e.g., ThemeContext).
- **CSS / Tailwind**: Modern styling approaches.

## 📂 Project Structure

- `/backend/ChatApplicationBackend/`: Contains the Spring Boot APIs, WebSocket config, and auth logic.
- `/frontend/`: Contains the Vite + React frontend application with Chat, Login, and Register components.

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Java Development Kit (JDK)](https://adoptium.net/) (v21+)

### Setup the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend/ChatApplicationBackend
   ```
2. Check your environment variables in `src/main/resources/application.properties`.
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```

### Setup the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## � API Endpoints

### Authentication
- `POST /auth/register`: Register a new user. Accepts `RegisterRequest` body.
- `POST /auth/login`: Authenticate and receive a JWT token. Accepts `LoginRequest` body.

### Messages
*Note: All message endpoints require a valid JWT token.*
- `GET /messages/recent-chats`: Fetch the current user's recently active chat threads.
- `GET /messages/{receiverId}`: Fetch complete conversation history with a specific user.
- `GET /messages/chat/{receiverId}`: (Alternative) fetch chat messages between the current user and the specified receiver.
- `POST /messages/{receiverId}`: Send a message to the specified user over HTTP. Accepts `MessageDTO` body.

### User Actions
*Note: All user endpoints require a valid JWT token.*
- `GET /user-data`: Retrieve the authenticated user's profile details.
- `GET /receiver/search/{receiverUsername}`: Search for a specific user to start a conversation.

## 🔌 WebSockets

The real-time messaging operates over STOMP over WebSockets. Connections require authentication via a JWT token.

- **Endpoint**: `/ws`
- **Publish Destination**: `/app/chat` (Payload: `{ receiverId, message }`)
- **Subscribe Destination**: `/user/queue/messages` (To receive incoming messages from others and confirmations of your own).

## �🔒 Security

- All API endpoints (except login/register) and WebSockets connections require a valid JWT token.
- Web requests are intercepted using `JwtFilter` and WebSockets via `WebSocketAuthInterceptor`.

## 📜 License

This project is open-source and licensed under the MIT License.