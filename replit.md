# QuickCourt - Local Sports Booking & Community Platform

## Overview
QuickCourt is a comprehensive sports booking platform with a hierarchical CRM/control panel system designed to manage multiple companies, facilities, and services under a unified administrative structure. It enables seamless booking of sports facilities for users while providing robust management tools for platform admins and facility owners. The project aims to consolidate searching, booking, payments, and social engagement into a single platform, with a vision to become the go-to app for local sports communities.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using **React** with **TypeScript**, utilizing **Vite** for fast development. **Wouter** handles lightweight client-side routing, and **TanStack React Query** manages server state. **Tailwind CSS** with **shadcn/ui** provides a consistent, modern UI, while **React Hook Form** with **Zod** handles form validation. The design system targets Gen-Z users with a mobile-first approach, custom color palette, Inter font family, and gradient backgrounds.

### Backend Architecture
The server-side application uses **Express.js** with **TypeScript** running on **Node.js**. It implements a **RESTful API** design with **JWT-based authentication** and **bcrypt** for secure session management. A **middleware-based architecture** supports request logging, authentication, and error handling, with **role-based access control** for user, owner, and admin permissions. Shared **Zod schemas** ensure validation consistency across client and server.

### Database Architecture
The application uses **PostgreSQL** via **Neon Database** with **Drizzle ORM** for type-safe operations. It follows a **schema-first approach** with relational data modeling, using **UUID primary keys** and **enum types** for standardized values.

### Authentication & Authorization
The system employs **JWT tokens** for stateless authentication and **role-based permissions** enforced by middleware guards. Client-side authentication state is managed using **React Context**, with persistent sessions via localStorage and appropriate redirection for unauthenticated users.

### State Management
A hybrid approach is used: **TanStack React Query** for server state (API data, caching), **React Context** for authentication and user session management, and **local component state** via useState/useReducer for UI-specific needs. **React Hook Form** manages form state.

### System Design Choices
QuickCourt is a multi-tenant system with a hierarchical structure:
- **Admin Level**: Platform controller with full system access.
- **Company Level**: Companies managed under admin oversight.
- **Owner Level**: Company controllers managing their assigned company's facilities and operations.
- **User Level**: Regular customers booking facilities.
The CRM serves as the central control panel, ensuring proper access control and data isolation throughout the hierarchy. A clear separation exists between the public booking interface and the `/crm` admin panel.

## External Dependencies

### Database & ORM
- **PostgreSQL** (via Neon Database)
- **Drizzle ORM**
- **Drizzle Kit**

### Authentication & Security
- **jsonwebtoken** (JSON Web Tokens)
- **bcrypt**
- **connect-pg-simple**

### Frontend Libraries
- **React**
- **Vite**
- **Wouter**
- **TanStack React Query**
- **React Hook Form** (@hookform/resolvers)
- **Zod**

### UI Components & Styling
- **Tailwind CSS**
- **Radix UI**
- **shadcn/ui**
- **Lucide React**
- **class-variance-authority**
- **clsx**

### Charts & Data Visualization
- **Recharts**
- **Date-fns**
```