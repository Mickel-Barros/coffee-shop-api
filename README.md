# ☕ Coffee Shop Orders API

This is a **production-ready REST API** built with **NestJS**, **TypeScript**, **Prisma**, and **PostgreSQL**, following **Clean Architecture** principles.

It supports role-based access control, secure authentication, strict order state management, and integration with external payment and notification services.

---

### 🚀 Tech Stack & Rationale

| Technology                    | Reason                                                               |
| ----------------------------- | -------------------------------------------------------------------- |
| **NestJS**                    | Opinionated framework with excellent modularity, DI, and scalability |
| **TypeScript**                | Type safety, easier refactoring, and long-term maintainability       |
| **Prisma + PostgreSQL**       | Type-safe ORM with predictable queries and robust migrations         |
| **JWT Authentication**        | Stateless, scalable, and battle-tested in production                 |
| **Swagger (OpenAPI)**         | Automatic API documentation for development and testing              |
| **ESLint + Prettier + Husky** | Enforced code quality and consistency on every commit                |
| **Clean Architecture**        | Clear separation between domain, application, and infrastructure     |

For larger systems, alternatives like OAuth2, Keycloak, or CQRS could be considered.

---

## Main Scripts

### Development

| Command         | Description                                                |
| --------------- | ---------------------------------------------------------- |
| `npm i`         | Install all dependencies                                   |
| `npm run dev`   | Runs the application in development mode with hot-reload   |
| `npm run build` | Compiles TypeScript and copies the Prisma Client to `dist` |
| `npm start`     | Runs the compiled application                              |

### Prisma

| Command                     | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| `npx prisma generate`       | Generates the Prisma Client (`src/generated/prisma`) |
| `npx prisma migrate deploy` | Applies database migrations                          |

### Docker

| Command                             | Description                         |
| ----------------------------------- | ----------------------------------- |
| `docker build -t coffee-shop-api .` | Starts containers in the background |
| `docker run -d coffee-shop-api`     | Stops and removes containers        |
| `docker-compose logs -f`            | Follows container logs in real time |

| Command            | Tests                    |
| ------------------ | ------------------------ |
| `npm run test`     | Run all tests once       |
| `npm run test:cov` | Run with coverage report |

---

💡 **Recommended workflow (without Docker):**

```bash
npm i                 # Install all dependencies
npx run generate      # generate Prisma Client
npm run dev           # run the app


```

---

### 👥 User Roles

| Role         | Permissions                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------- |
| **Manager**  | Full access to all endpoints<br>Can update order statuses<br>Can view all orders                  |
| **Customer** | Can view the menu<br>Can place orders<br>Can only view their own orders<br>Cannot update statuses |

> The role is embedded in the JWT payload (not sent via headers).

---

### 🔐 Authentication

Authentication is handled via **JWT**.

Example payload:

{
"sub": "user-id",
"role": "manager"
}

Authorization is enforced using:

JwtStrategy
RolesGuard
@Roles() decorator

---

### 📦 Order Status Flow

Orders must follow a strict state machine:

Waiting → Preparation → Ready → Delivered

Invalid transitions are rejected at the use case level, ensuring domain integrity.

---

### ☕ Menu & Pricing

The menu is static and exposed via GET /menu.

Each product has:

- Base price

- Available variations

- Price adjustments per variation

> Example:

Product Base Price Variation Price Change
Latte $4.00 Vanilla +$0.30
Espresso $2.50 Double Shot +$1.00
Donut $2.00 Boston Cream +$0.50

---

### 📡 API Endpoints

> GET /menu

Returns the complete product catalog with pricing and variations.

> POST /orders

Places a new order.

Accepts a list of products and variations

Calculates total price

Integrates with external Payment Service

Order is created only if payment succeeds

Initial status: Waiting

External integration:

> POST https://challenge.trio.dev/api/v1/payment
> { "value": TOTAL_AMOUNT }

> GET /orders

Returns a paginated list of orders.

Managers: all orders

Customers: only their own orders

Pagination metadata included.

> GET /orders/{id}

Returns full order details:

Items and variations

Individual prices

Total price

Status

Creation timestamp

> PATCH /orders/{id}/status

Manager only

Enforces valid status transitions

Integrates with external Notification Service

External integration:

> POST https://challenge.trio.dev/api/v1/notification

{ "status": "Ready" }

---

### 🧼 Clean Architecture Overview

```txt
src/
├── domain/
│   ├── entities
│   ├── enums
│   └── repositories
├── application/
│   ├── use-cases
│   └── mappers
│   └── services
├── infrastructure/
│   ├── http
│   ├── prisma
│   └──
├── shared/
│   ├── catalog
│   ├── filters
│   ├── middlewares
│   └── logger
└── main.ts
```

Key Principles Applied

- Controllers only orchestrate

- Use cases contain business rules

- Repositories are abstractions

- Prisma is isolated to infrastructure

- DTOs are never passed to use cases

- All external input is sanitized via mappers

---

### 🛡️ Security & Quality

- JWT authentication

- Role-based access control

- Rate limiting (global + per route)

- CORS restricted by environment

- Input validation & sanitization

- Helmet security headers

- Global error handling

- Centralized logging

- Graceful database shutdown

---

### 📄 Environment Configuration

Separate environments supported:

- development

- production

Configuration is validated at startup using ConfigModule.

Swagger is enabled only in development.

---

### 🧪 Code Quality

- ESLint for static analysis

- Prettier for formatting

- Husky + lint-staged to block bad commits

No code enters the repository without passing quality checks.

---

### 🧠 Final Notes

This project prioritizes:

- Clarity over cleverness

- Explicit boundaries over shortcuts

- Business rules protected at the domain level

- This codebase is intentionally structured to be easy to evolve, test, and reason about.

---
