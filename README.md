# CMS Backend + Frontend

A production-style Content Management System built with Spring Boot on the backend and React + Vite on the frontend. It supports public article browsing and a role-based admin dashboard for managing articles, categories, tags, media, and users.

## Features

- Public blog homepage with search, category filtering, and tag filtering.
- Article detail pages with published content and metadata.
- Authentication with JWT-based login and role-aware access control.
- Dashboard views for overview stats, article management, category management, tag management, media library, and user control.
- Seeded Super Admin account created on startup if it does not already exist.

## Tech Stack

- Backend: Java 21, Spring Boot 3.5.4, Spring Security, Spring Data JPA, JWT, MapStruct, PostgreSQL
- Frontend: React 19, Vite, React Router, Lucide icons
- Dev database: H2

## Project Structure

- `src/main/java` - Spring Boot application source
- `src/main/resources` - application config and database migration resources
- `cms-frontend` - React frontend application

## Prerequisites

- Java 21
- Node.js 18+ and npm
- PostgreSQL for production

## Run Locally

### Backend

```bash
./mvnw spring-boot:run
```

### Frontend

```bash
cd cms-frontend
npm install
npm run dev
```

## Production Environment Variables

The backend production profile expects these values:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET_KEY`
- `JWT_ACCESS_TOKEN_EXPIRATION` optional
- `JWT_REFRESH_TOKEN_EXPIRATION` optional

The bootstrap admin account can also be overridden with `cms.bootstrap` properties.

## Default Admin Login

Unless your deployment overrides bootstrap values, the seeded admin account is:

- Email: `admin@cms.local`
- Password: `Admin@1234`

## Screenshots

The screenshots show the main CMS experience across public and admin views.

- Dashboard overview: a summary screen with article, category, tag, and media stats plus the latest updated article.
- Articles management: a table-based admin page for searching, filtering, publishing, archiving, editing, and deleting articles.
- User accounts control: an admin panel for viewing system users, their roles, and account status.
- Public homepage: a clean landing page for visitors to browse articles, filter by category or tag, and open article details.

## Notes

- Production mode uses `spring.profiles.active=prod` and reads the database/JWT settings from environment variables.
- The app seeds permissions, roles, and a Super Admin user on startup if they are missing.