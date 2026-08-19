# ChatsApp - WhatsApp-like Chat Application

A full-stack chat application built with the MEAN stack (MongoDB, Express.js, Angular, Node.js) that replicates WhatsApp's core functionality with additional features like typing biometric authentication, end-to-end encryption, and Instagram-like profiles.

## Features

### 🔐 Authentication & Security
- **Typing Biometric Authentication**: Analyzes user typing patterns for enhanced security
- **End-to-End Encryption**: All messages are encrypted using NaCl cryptography
- **JWT-based Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage

### 💬 Chat Features
- **Real-time Messaging**: Socket.io for instant message delivery
- **Typing Indicators**: Shows when users are typing
- **Message Encryption**: All messages encrypted before transmission
- **Online Status**: Real-time online/offline status
- **Message History**: Persistent message storage

### 👥 Social Features
- **Contact Discovery**: Find friends using phone numbers
- **Follow System**: Follow/unfollow other users
- **Status Updates**: WhatsApp-like status stories with image/video support
- **Profile Management**: Instagram-like profile interface

### 📞 Communication
- **Voice Calls**: WebRTC-based voice calling
- **Video Calls**: WebRTC-based video calling
- **Call History**: Track all call activities

### 🎨 User Interface
- **WhatsApp-like Design**: Familiar chat interface
- **Instagram-like Profiles**: Modern profile layout
- **Responsive Design**: Works on desktop and mobile
- **Material Design**: Angular Material components

## Tech Stack

### Frontend (Angular)
- **Angular 20**: Latest Angular framework
- **Angular Material**: UI component library
- **Socket.io Client**: Real-time communication
- **RxJS**: Reactive programming
- **TypeScript**: Type-safe development

### Backend (Node.js)
- **Express.js**: Web framework
- **Socket.io**: Real-time communication
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication tokens
- **Bcrypt**: Password hashing

### Security
- **NaCl Cryptography**: End-to-end encryption
- **Typing Pattern Analysis**: Biometric authentication
- **Phone Number Hashing**: Privacy-preserving contact discovery

## Project Structure

```
ChatsApp/
├── client/                 # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── auth/          # Login/Signup components
│   │   │   │   ├── chat/          # Chat interface
│   │   │   │   ├── profile/       # Profile management
│   │   │   │   └── status/        # Status stories
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── encryption.service.ts
│   │   │   │   ├── socket.service.ts
│   │   │   │   └── typing-biometric.service.ts
│   │   │   └── guards/
│   │   │       └── auth.guard.ts
│   │   └── styles.css
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── models/         # MongoDB models
│   │   │   ├── User.js
│   │   │   ├── Message.js
│   │   │   ├── Status.js
│   │   │   ├── Call.js
│   │   │   └── Follow.js
│   │   ├── routes/         # API routes
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── messages.js
│   │   │   ├── statuses.js
│   │   │   ├── calls.js
│   │   │   └── follows.js
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── utils/
│   │   │   └── phoneHash.js
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- Angular CLI (v20 or higher)

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/chatsapp
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:4200
NODE_ENV=development
```

4. Start the server:
```bash
npm start
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

4. Open your browser and navigate to `http://localhost:4200`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search users

### Messages
- `GET /api/messages/:chatId` - Get chat messages
- `POST /api/messages` - Send message

### Status
- `GET /api/statuses` - Get status updates
- `POST /api/statuses` - Create status update

### Calls
- `POST /api/calls/initiate` - Initiate call
- `POST /api/calls/accept/:callId` - Accept call
- `POST /api/calls/reject/:callId` - Reject call
- `POST /api/calls/end/:callId` - End call

### Follows
- `POST /api/follows/discover` - Discover contacts
- `POST /api/follows/follow/:userId` - Follow user
- `DELETE /api/follows/unfollow/:userId` - Unfollow user
- `GET /api/follows/followers` - Get followers
- `GET /api/follows/following` - Get following list

## Socket.io Events

### Client to Server
- `join` - Join user room
- `sendMessage` - Send message
- `typing` - User typing indicator
- `stopTyping` - Stop typing indicator
- `initiateCall` - Initiate call
- `acceptCall` - Accept call
- `rejectCall` - Reject call
- `endCall` - End call

### Server to Client
- `newMessage` - New message received
- `userTyping` - User typing notification
- `userStopTyping` - User stopped typing
- `incomingCall` - Incoming call notification
- `callAccepted` - Call accepted
- `callRejected` - Call rejected
- `callEnded` - Call ended

## Security Features

### End-to-End Encryption
- Uses NaCl (TweetNaCl) for encryption
- Each user has a unique key pair
- Messages encrypted before transmission
- Private keys stored encrypted locally

### Typing Biometric Authentication
- Analyzes typing patterns during login
- Measures keystroke timing and pressure
- Creates unique biometric signature
- Enhances security beyond passwords

### Contact Discovery Privacy
- Phone numbers hashed before storage
- No plain text phone numbers in database
- Secure contact matching algorithm

## Development

### Running Tests
```bash
# Frontend tests
cd client
ng test

# Backend tests
cd server
npm test
```

### Building for Production
```bash
# Frontend build
cd client
ng build --prod

# Backend build
cd server
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements

- [ ] Group chat functionality
- [ ] File sharing with encryption
- [ ] Push notifications
- [ ] Message reactions
- [ ] Voice messages
- [ ] Advanced biometric authentication
- [ ] Multi-device support
- [ ] Message scheduling
- [ ] Chat backup/restore
