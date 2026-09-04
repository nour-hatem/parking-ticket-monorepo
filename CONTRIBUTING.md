# 🤝 Contributing to Parking Ticket Monorepo

Thank you for considering contributing to the Parking Ticket Monorepo!

## 🚀 Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nour-hatem/parking-ticket-monorepo.git
   cd parking-ticket-monorepo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build shared dependencies**:
   ```bash
   npm run build --workspace=@parking-system/shared
   ```

4. **Start Development Services**:
   - NestJS Backend: `npm run dev:api`
   - Next.js Web Frontend: `npm run dev:web`

## 📦 Monorepo Guidelines

- Keep shared types in `packages/shared`.
- All PRs must target the `main` branch.
