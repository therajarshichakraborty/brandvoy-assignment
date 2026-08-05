# IPL Data Platform (IPL Pulse)

A production grade, full stack analytical platform designed to model, query,
visualize, and document Indian Premier League (IPL) cricket data. Built with
Next.js App Router, TypeScript, Drizzle ORM, PostgreSQL, Tailwind CSS, Zod, and
Swagger OpenAPI.

---

## 1. Executive Summary

IPL Pulse provides clean cricket intelligence for teams, players, match
statistics, and career analytics. The platform processes high volume IPL match
data, stores relational data structures inside PostgreSQL, executes performant
SQL aggregations for leaderboards, exposes RESTful endpoints, and renders
responsive analytical interfaces.

---

## 2. Requirement Compliance Matrix

The table below tallies every requirement specified in the Brand Voy assignment
against the actual technical implementation in this repository.

| Requirement Area         | Assignment Specification                                                               | Implementation Status | Workspace Location                                                                                                                                                                                                    |
| :----------------------- | :------------------------------------------------------------------------------------- | :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Database & Schema**    | Relational schema in PostgreSQL with migrations and seed data                          | Completed             | [db/schema](./db/schema), [scripts/seed.ts](./scripts/seed.ts)                                                                      |
| **Backend APIs**         | RESTful JSON APIs with pagination, filtering, validation, and error handling           | Completed             | [app/api](./app/api), [lib/validators.ts](./lib/validators.ts)                                                                      |
| **Health Check**         | Expose database connectivity health endpoint                                           | Completed             | [app/api/health/route.ts](./app/api/health/route.ts)                                                                                                                         |
| **API Documentation**    | Interactive OpenAPI 3.0 documentation with Swagger UI                                  | Completed             | [app/api-docs/page.tsx](./app/api-docs/page.tsx), [lib/openAPI/swagger.ts](./lib/openAPI/swagger.ts)                                |
| **Frontend UI**          | Responsive web application with dashboards, charts, tables, loading/empty/error states | Completed             | [app/page.tsx](./app/page.tsx), [app/players](./app/players), [app/matches](./app/matches) |
| **Containerization**     | Dockerfile and docker-compose for local development environment                        | Completed             | [Dockerfile](./Dockerfile), [docker-compose.yml](./docker-compose.yml)                                                              |
| **CI/CD Pipeline**       | GitHub Actions workflow for linting, typechecking, tests, and Docker builds            | Completed             | [.github/workflows/ci.yml](./.github/workflows/ci.yml)                                                                                        |
| **Cloud Deployment**     | Production deployment on major cloud infrastructure                                    | Completed             | Live on Vercel and Neon PostgreSQL

---

## 3. Platform Architecture and Visual Demonstrations

### System Interface Preview

#### Home Dashboard

![Home Dashboard](./public/image2.png)

The home screen provides high level insights, tournament health metrics, quick
navigation filters, top batting runs, economy leaders, and direct access to
dynamic leaderboards.

#### Player Profile and SQL Statistics

![Player Profile](./public/image3.png)

Individual player profiles combine biography attributes with aggregated career
stats computed via direct SQL queries against match records.

#### Lifetime Career Records

![Lifetime Career Records](./public/image4.png)

Detailed format tabs (TEST, ODI, T20I, T20, LISTA, FIRSTCLASS, T10) display
lifetime batting and bowling figures loaded from JSON datasets.

#### Interactive OpenAPI Swagger Interface

![OpenAPI Swagger Docs](./public/image1.png)

All backend endpoints are documented with OpenAPI 3.0 standards and can be
interactively executed directly from the browser interface.

---

## 4. Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Radix UI components, Lucide Icons
- **Data Visualization**: Recharts, Embla Carousel
- **Database**: PostgreSQL 18+
- **ORM & Query Builder**: Drizzle ORM, Drizzle Kit
- **API Validation**: Zod Schemas
- **Documentation**: Swagger UI React, next-swagger-doc, OpenAPI 3.0
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions

---

## 5. Database Schema Design

The relational database schema is structured to eliminate redundancy while
preserving query performance.

```text
+------------------+         +-------------------------+         +------------------------+
|      teams       |         |         matches         |         |        players         |
+------------------+         +-------------------------+         +------------------------+
| tid (PK)         |<--------| teamAId / teamBId (FK)  |         | pid (PK)               |
| title            |         | tossWinnerId (FK)       |         | title                  |
| abbr             |         | winnerId (FK)           |         | country                |
| logoUrl          |         +-------------------------+         | playingRole            |
+------------------+                      |                      +------------------------+
                                          |                                  |
                                          v                                  v
                             +-------------------------+         +------------------------+
                             |     innings_stats       |-------->| batting_innings_stats  |
                             +-------------------------+         +------------------------+
                             | id (PK)                 |         | playerId (FK)          |
                             | matchId (FK)            |         | runs, balls, 4s, 6s    |
                             | battingTeamId (FK)      |         +------------------------+
                             | bowlingTeamId (FK)      |                     |
                             +-------------------------+                     v
                                                                 +------------------------+
                                                                 | bowling_innings_stats  |
                                                                 +------------------------+
                                                                 | playerId (FK)          |
                                                                 | overs, wickets, runs   |
                                                                 +------------------------+
```

---

## 6. Backend API Endpoints

All endpoints return standardized JSON structures containing success status,
data payload, and metadata where applicable.

### Health Check

- `GET /api/health`
  - Validates active database connectivity via SQL execution (`SELECT 1`).
  - Returns timestamp, status, and database connection state.

### Teams API

- `GET /api/teams`
  - Paginated list of IPL teams with search capabilities across title,
    abbreviation, and alternate names.
- `GET /api/teams/{id}`
  - Detailed record of a specific team by unique ID.

### Players API

- `GET /api/players`
  - Paginated player roster with filtering by role, country, team, and name
    search.
- `GET /api/players/{id}`
  - Comprehensive player profile with computed IPL career statistics (runs,
    strike rate, average, wickets, economy) aggregated directly from database
    tables.

### Matches API

- `GET /api/matches`
  - Paginated match schedule and results with team filtering and date range
    filtering (`startDate`, `endDate`).
- `GET /api/matches/{id}`
  - Detailed match scorecard including toss info, winner details, innings
    breakdown, and player performance stats.

### Statistics & Leaderboards

- `GET /api/stats/batting-leaders`
  - Dynamic SQL aggregation ranking top batsmen by runs, batting average, strike
    rate, fours, or sixes.
- `GET /api/stats/bowling-leaders`
  - Dynamic SQL aggregation ranking top bowlers by wickets, economy rate, strike
    rate, or maiden overs.

---

## 7. Local Setup and Installation Guide

### Prerequisites

- Node.js 20+ or Bun runtime
- Docker Desktop and Docker Compose
- Git

### Installation Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/therajarshichakraborty/brandvoy-assignment.git
   cd brandvoy-assignment
   ```

2. **Configure Environment Variables** Create a `.env` file in the root
   directory:

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ipl_db"
   NODE_ENV="development"
   PORT=4040
   ```

3. **Spin Up PostgreSQL Container**

   ```bash
   docker compose up -d
   ```

4. **Run Database Setup (Migrations and Seeding)** Execute the automated
   database setup command:

   ```bash
   bun run db:setup
   ```

   Or execute step-by-step:

   ```bash
   bun run db:migrate
   bun run db:seed
   ```

5. **Start Development Server**
   ```bash
   bun run dev
   ```
   Access the application at `http://localhost:4040` and API documentation at
   `http://localhost:4040/api-docs`.

---

## 8. Verification and Quality Assurance

Run the comprehensive local continuous integration suite:

```bash
bun run ci:local
```

This single command executes the following verification pipeline:

1. **ESLint**: `eslint .`
2. **TypeScript Compilation**: `tsc --noEmit`
3. **Unit Tests**: `bun test`
4. **Production Build**: `next build`

---

## 9. Containerization and DevOps

### Docker Local Orchestration

The local environment is containerized using `docker-compose.yml`:

- PostgreSQL database container on port `5432`.
- Healthcheck probes to ensure database readiness prior to migration execution.

### Continuous Integration Workflow

The GitHub Actions workflow located at
[.github/workflows/ci.yml]
automates quality control:

- Triggers on pushes and pull requests to `main`.
- Runs linter, type checker, unit tests, and builds the container image.

---

## 10. Repository Structure

```text
brandvoy-assignment/
├── .github/workflows/   # CI/CD pipeline definitions
├── app/                 # Next.js App Router pages and API routes
│   ├── api/             # RESTful API route handlers
│   ├── api-docs/        # OpenAPI Swagger UI page
│   ├── matches/         # Match listing and detail screens
│   ├── players/         # Player listing and profile screens
│   ├── stats/           # Dynamic leaderboard analytical views
│   └── teams/           # Team listing and team detail screens
├── components/          # Reusable UI components and navigation
├── data/                # Raw dataset and player JSON statistics
├── db/                  # Schema definitions and migration files
├── docker-compose.yml   # Multi-container orchestration config
├── Dockerfile           # Multi-stage production container build
├── lib/                 # OpenAPI configuration, Zod schemas, logger
├── public/              # Static assets and screenshot previews
├── scripts/             # Database seeding and dataset analysis scripts
└── tests/              # Automated unit and integration tests
```

---

## Author

**Rajarshi Chakraborty** Full Stack Developer
