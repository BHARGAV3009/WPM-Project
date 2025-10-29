---
description: Repository Information Overview
alwaysApply: true
---

# ChatsApp Information

## Summary
ChatsApp is a WhatsApp clone built using the MEAN stack (MongoDB, Express, Angular, Node.js). It features real-time messaging, user authentication, status updates, and end-to-end encryption.

## Structure
- **server/**: Backend Node.js/Express application with MongoDB integration
- **client/**: Frontend Angular application
- **docker-compose.yml**: Container orchestration for development and deployment

## Projects

### Server (Node.js/Express)
**Configuration File**: server/package.json

#### Language & Runtime
**Language**: JavaScript
**Version**: Node.js
**Build System**: npm
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- express: ^5.1.0
- mongoose: ^8.19.1
- socket.io: ^4.8.1
- jsonwebtoken: ^9.0.2
- bcryptjs: ^3.0.2
- dotenv: ^17.2.3
- cors: ^2.8.5
- tweetnacl: ^1.0.3

**Development Dependencies**:
- nodemon: ^3.1.10

#### Build & Installation
```bash
cd server
npm install
npm start
```

#### Docker
**Dockerfile**: server/Dockerfile
**Configuration**: Containerized Node.js application with MongoDB connection

#### Main Files & Resources
- **src/server.js**: Main entry point for the Express server
- **src/app.js**: Express application setup and middleware configuration
- **src/config/db.js**: MongoDB connection configuration
- **src/models/**: MongoDB schema definitions for User, Message, and Status
- **src/routes/**: API route handlers for authentication, users, messages, and statuses
- **src/utils/**: Utility functions including phone number hashing

### Client (Angular)
**Configuration File**: client/angular.json

#### Language & Runtime
**Language**: TypeScript
**Version**: Angular ^20.3.0
**Build System**: Angular CLI
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- @angular/core: ^20.3.0
- @angular/common: ^20.3.0
- @angular/forms: ^20.3.0
- @angular/router: ^20.3.0
- @angular/material: ^20.2.9
- rxjs: ~7.8.0
- socket.io-client: ^4.8.1
- ngx-socket-io: ^4.9.3
- tailwindcss: ^4.1.14

**Development Dependencies**:
- @angular/cli: ^20.3.6
- @angular/compiler-cli: ^20.3.0
- typescript: ~5.9.2
- jasmine-core: ~5.9.0
- karma: ~6.4.0

#### Build & Installation
```bash
cd client
npm install
ng serve
```

#### Testing
**Framework**: Jasmine/Karma
**Test Location**: client/src/app/**/*.spec.ts
**Configuration**: client/karma.conf.js
**Run Command**:
```bash
ng test
```

#### Main Files & Resources
- **src/main.ts**: Application bootstrap file
- **src/app/app.module.ts**: Main Angular module configuration
- **src/app/app-routing.module.ts**: Application routing configuration
- **src/app/services/**: Angular services for authentication, socket communication, and encryption
- **src/app/components/**: Angular components organized by feature (auth, chat, profile, status)

## Docker Configuration
**docker-compose.yml**: Defines multi-container setup with Node.js backend and Angular frontend
**Configuration**: Development and production environments with appropriate volume mappings and network settings