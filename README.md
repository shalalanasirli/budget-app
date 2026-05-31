# BudgetApp

A budgeting-first app that helps users control spending with minimal effort.

## Monorepo Structure

```
budget-app/
├── backend/   # ASP.NET Core Web API — layered architecture (Controllers / Services / Repositories)
├── mobile/    # Expo + React Native + TypeScript + Expo Router
└── docker-compose.yml
```

## Prerequisites

| Tool | Version |
|------|---------|
| .NET SDK | 8.0+ |
| Node.js | 20+ |
| Docker & Docker Compose | latest |
| Expo CLI | latest (`npm i -g expo-cli`) |

## Quick Start

### 1. Start the database

```bash
docker compose up -d
```

PostgreSQL will be available at `localhost:5432` with:
- Database: `budgetapp`
- User: `postgres`
- Password: `postgres`

### 2. Run the backend

```bash
cd backend/src/BudgetApp.API
dotnet run
```

The API will be available at `http://localhost:5000` (Swagger at `/swagger`).

### 3. Run the mobile app

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go on your device, or press `i` for iOS simulator / `a` for Android emulator.

## Environment Variables

### Backend

Copy `backend/src/BudgetApp.API/appsettings.Development.json.example` to `appsettings.Development.json` and fill in:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=budgetapp;Username=postgres;Password=postgres"
  },
  "Jwt": {
    "Secret": "your-secret-key-min-32-chars",
    "Issuer": "budget-app",
    "Audience": "budget-app-mobile",
    "ExpiryHours": 168
  }
}
```

### Mobile

Copy `mobile/.env.example` to `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Architecture

### Backend — Layered Architecture

- **Controllers** — HTTP endpoints, no business logic
- **Services** — business logic
- **Repositories** — database access via EF Core
- **Models** — domain entities
- **DTOs** — API request/response shapes

### Mobile — Expo Router

| Route | Screen |
|-------|--------|
| `(auth)/login` | Login |
| `(auth)/register` | Register |
| `onboarding/welcome` | Welcome |
| `onboarding/currency` | Currency selection |
| `onboarding/budget-setup` | Budget per category |
| `onboarding/success` | Setup complete |
| `(tabs)/` | Dashboard |
| `(tabs)/history` | Expense history |
| `add-expense` | Add expense (modal) |
| `receipt-scan` | Camera / image picker |
| `receipt-confirm` | Confirm extracted data |
