# 🅿️ Parking System Monorepo

An enterprise-grade, full-stack monorepo for parking ticket management built with **NestJS**, **Next.js 16 (App Router)**, **Socket.io**, and **TypeScript**.

---

## 🏗️ Monorepo Architecture

This workspace utilizes `npm workspaces` to maintain clear separation of concerns while enabling type sharing across frontend and backend applications.

```text
parking-system/
├── apps/
│   ├── api/             # 🛡️ NestJS Backend API & Socket.io Gateway (Port 3000)
│   └── web/             # 💻 Next.js 16 Web Application with Dark Mode (Port 3001)
├── packages/
│   └── shared/          # 🔗 Shared TypeScript Contracts & DTO Interfaces
├── docker-compose.yml   # 🐘 PostgreSQL Database Container Service
└── package.json         # ⚡ Root Monorepo Orchestration
```

---

## ⚡ Key Features

- **Real-Time Live Updates**: Powered by NestJS `@WebSocketGateway` and `Socket.io-client` event-driven architecture.
- **Shared Types**: Centralized `@parking-system/shared` package acting as the Single Source of Truth for domain models (`Ticket`, `TicketStatus`, `CreateTicketPayload`).
- **Modern Glassmorphic UI**: High-end Next.js frontend with live socket connection status indicator.
- **Linear Git History**: Single continuous commit timeline tracking full project evolution from backend inception through frontend development to monorepo integration.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9
- Docker & Docker Compose (for PostgreSQL)

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Shared Workspace
```bash
npm run build --workspace=@parking-system/shared
```

### 3. Run Applications
```bash
# Start NestJS Backend API (http://localhost:3000)
npm run dev:api

# Start Next.js Frontend (http://localhost:3001)
npm run dev:web
```

---

## 🌐 API & Socket Documentation

- **Swagger Documentation**: Available at `http://localhost:3000/api/docs` when API is running.
- **WebSocket Gateway**: Endpoint `ws://localhost:3000` listening on event `ticket.created`.

---

## 📄 License
UNLICENSED — Internal Project Workspace.
