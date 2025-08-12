# QuickCourt - Local Sports Booking & Community Platform

## Overview
QuickCourt is a multi-tenant sports booking platform with a hierarchical CRM/control panel system. It enables unified administration of multiple companies, facilities, and services. The platform serves as a central control panel where admins manage companies and assign owners, and owners manage their company's facilities and operations. It supports a structured hierarchy:
- **Admin Level**: Platform controller with full system access.
- **Company Level**: Multiple companies managed under admin oversight.
- **Owner Level**: Company controllers managing their assigned company's facilities.
- **User Level**: Regular customers booking sports facilities.

The business vision is to provide a comprehensive solution for sports facility booking and community engagement, offering market potential in streamlining sports management and enhancing user experience.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using **React** with **TypeScript**, following a component-based design pattern.
- **Build Tool**: Vite for fast development and optimized builds.
- **Routing**: Wouter for lightweight client-side routing.
- **State Management**: TanStack React Query for server state management, caching, and API data fetching.
- **UI/UX**: Tailwind CSS with shadcn/ui for consistent, modern UI design.
- **Forms**: React Hook Form with Zod validation for robust form handling.
- **Structure**: Modular organization with separate directories for components, pages, hooks, and utilities, adhering to atomic design principles.

### Backend Architecture
The server-side application uses **Express.js** with **TypeScript** on **Node.js**.
- **API Design**: RESTful API with clear endpoint structures.
- **Authentication**: JWT-based authentication with bcrypt for password hashing.
- **Middleware**: Extensive use of middleware for request logging, authentication, and error handling.
- **Authorization**: Role-based access control supporting user, owner, and admin permissions.
- **Validation**: Shared Zod schemas for validation across client and server.

### Database Architecture
The application uses **PostgreSQL** as the primary database with **Drizzle ORM** for type-safe operations.
- **Hosted Solution**: Neon Database for scalability and reliability.
- **Schema**: Schema-first approach with TypeScript types generated from database schemas.
- **Modeling**: Relational data modeling with foreign key relationships.
- **Data Types**: Enum types for standardized values and UUID primary keys for security.

### Authentication & Authorization
A comprehensive authentication system is implemented:
- **Tokens**: JWT tokens for stateless authentication.
- **Permissions**: Role-based permissions with middleware guards for protected routes.
- **Client-side State**: React Context API for authentication state.
- **Persistence**: Persistent sessions using localStorage.

### State Management
A hybrid approach to state management is employed:
- **Server State**: TanStack React Query for API data and caching.
- **Auth State**: React Context for authentication and user sessions.
- **UI State**: Local component state (useState, useReducer) for UI-specific logic.
- **Form State**: React Hook Form for optimized form management.

### UI/UX Design System
The frontend features a cohesive design system targeting Gen-Z users:
- **Responsiveness**: Mobile-first responsive design with Tailwind CSS.
- **Components**: shadcn/ui component library for consistent and accessible UI.
- **Theming**: Custom color palette with CSS custom properties.
- **Typography**: Inter font family for modern readability.
- **Aesthetics**: Gradient backgrounds and modern styling for a youthful appeal.
- **CRM Dashboard**: Streamlined, role-based dashboard for Admin and Owner views, featuring simplified navigation, enhanced KPI cards, compact facility overviews, and quick action buttons.

### Technical Implementations
- **Stripe Payment**: Temporarily simulated Stripe payment flow with dual payment method support (wallet and mocked card).
- **CRM Control Panel**: Full hierarchical CRM control panel with user, company, owner, and facility management.
- **Database Integration**: Utilizes Neon database with Drizzle ORM.
- **Authentication**: Robust authentication system with JWT, bcrypt, and role-based access control.
- **Facility Management**: Comprehensive facility creation forms with multi-court support and rich fields.
- **Analytics Dashboard**: Integrated professional analytics dashboard with live data visualizations using Recharts.

## External Dependencies

### Database & ORM
- **PostgreSQL**: Primary database.
- **Neon Database**: Hosted PostgreSQL solution.
- **Drizzle ORM**: Type-safe database queries.
- **Drizzle Kit**: Database schema management.

### Authentication & Security
- **jsonwebtoken**: For JWT token handling.
- **bcrypt**: For password hashing.
- **connect-pg-simple**: For PostgreSQL session storage.

### Frontend Libraries
- **React**: UI framework.
- **Vite**: Build tool.
- **Wouter**: Client-side routing.
- **TanStack React Query**: Server state management.
- **React Hook Form**: Form handling.
- **Zod**: Runtime type validation.

### UI Components & Styling
- **Tailwind CSS**: Utility-first styling.
- **Radix UI**: Component primitives.
- **shadcn/ui**: Pre-styled UI components.
- **Lucide React**: Iconography.
- **class-variance-authority** and **clsx**: Conditional styling.

### Charts & Data Visualization
- **Recharts**: For dashboard analytics.
- **Date-fns**: Date manipulation.