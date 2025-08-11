# QuickCourt - Local Sports Booking & Community Platform

## Overview

QuickCourt is a full-stack, mobile-first web application designed for Gen-Z athletes to book sports facilities, join matches, manage subscriptions, split payments, earn rewards, and receive instant confirmations. The platform serves as a comprehensive sports booking and community platform that bridges the gap between sports facility owners and players.

The application supports three main user roles: regular users who book courts and join matches, facility owners who list and manage their venues, and administrators who oversee platform operations and facility approvals.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### August 11, 2025 - Migration to Replit & UI/UX Focus
- **Successfully migrated from Replit Agent**: Project now runs cleanly in Replit environment with proper database setup
- **Frontend UI/UX improvement phase**: Focus shifted to enhancing user-facing website interface and experience
- **Base functionality complete**: CRM/admin panel and backend systems fully operational
- **Current priority**: Improving main website UI for better user engagement and conversion
- **Future roadmap planned**: Comprehensive feature set including match creation, community features, social engagement, and enhanced booking experience

### Previous - Application Restructuring
- **Separated user interfaces**: Created distinct CRM/admin panel at `/crm` for facility owners and administrators
- **Removed mobile app focus**: Updated user interface to focus on web-based booking, removed app download sections
- **Role-based authentication**: Implemented separate login systems for regular users vs admin/owner users
- **Role-based permissions**: 
  - **Admin role**: Full access to all facilities, bookings, analytics, and platform management
  - **Owner role**: Access only to their own facilities, bookings, and analytics
- **CRM dashboard features**: Built comprehensive management interface with facilities, bookings, analytics, inventory, and settings tabs
- **Test credentials working**: 
  - Admin: admin@quickcourt.com / admin123 (super user with full platform access)
  - Owner: owner@quickcourt.com / owner123 (limited to own facilities)
  - Both accounts properly created in database with correct password hashing

## System Architecture

### Frontend Architecture
The client-side application is built using **React** with **TypeScript** for type safety and better developer experience. The architecture follows a component-based design pattern with:

- **Vite** as the build tool and development server for fast hot-reloading and optimized builds
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack React Query** for server state management, caching, and API data fetching
- **Tailwind CSS** with **shadcn/ui** component library for consistent, modern UI design
- **React Hook Form** with **Zod** validation for form handling and data validation

The frontend uses a modular structure with separate directories for components, pages, hooks, and utilities. Component organization follows the atomic design principle with reusable UI components in the `/components/ui` directory.

### Backend Architecture
The server-side application uses **Express.js** with **TypeScript** running on **Node.js**. Key architectural decisions include:

- **RESTful API** design with clear endpoint structure (`/api/auth`, `/api/facilities`, `/api/bookings`, etc.)
- **JWT-based authentication** with **bcrypt** for password hashing and secure session management
- **Middleware-based architecture** for request logging, authentication, and error handling
- **Role-based access control** supporting user, owner, and admin permissions
- **Shared schema validation** using Zod schemas that work across both client and server

### Database Architecture
The application uses **PostgreSQL** as the primary database with **Drizzle ORM** for type-safe database operations:

- **Neon Database** as the hosted PostgreSQL solution for scalability and reliability
- **Schema-first approach** with TypeScript types generated from database schemas
- **Relational data modeling** with proper foreign key relationships between users, facilities, courts, bookings, and reviews
- **Enum types** for standardized values (user roles, sports types, booking statuses, facility statuses)
- **UUID primary keys** for better security and distributed system compatibility

### Authentication & Authorization
The system implements a comprehensive auth system with:

- **JWT tokens** for stateless authentication
- **Role-based permissions** with middleware guards for protected routes
- **Client-side auth context** using React Context API for state management
- **Persistent sessions** using localStorage for token storage
- **Protected routes** that redirect unauthenticated users appropriately

### State Management
The application uses a hybrid approach for state management:

- **TanStack React Query** for server state (API data, caching, synchronization)
- **React Context** for authentication state and user session management
- **Local component state** using useState and useReducer for UI-specific state
- **Form state** managed by React Hook Form for optimal performance

### UI/UX Design System
The frontend implements a cohesive design system targeting Gen-Z users:

- **Mobile-first responsive design** with Tailwind CSS breakpoints
- **shadcn/ui component library** for consistent, accessible UI components
- **Custom color palette** with CSS custom properties for theming
- **Inter font family** for modern, readable typography
- **Gradient backgrounds and modern styling** appealing to younger demographics

## External Dependencies

### Database & ORM
- **PostgreSQL** via Neon Database for reliable, scalable data storage
- **Drizzle ORM** for type-safe database queries and migrations
- **Drizzle Kit** for database schema management and migrations

### Authentication & Security
- **JSON Web Tokens (jsonwebtoken)** for stateless authentication
- **bcrypt** for secure password hashing and validation
- **connect-pg-simple** for PostgreSQL session storage

### Frontend Libraries
- **React** with TypeScript for the user interface framework
- **Vite** for fast development and optimized production builds
- **Wouter** for lightweight client-side routing
- **TanStack React Query** for server state management and caching
- **React Hook Form** with **@hookform/resolvers** for form handling
- **Zod** for runtime type validation and schema definition

### UI Components & Styling
- **Tailwind CSS** for utility-first styling approach
- **Radix UI** component primitives for accessible, unstyled components
- **shadcn/ui** for pre-styled, customizable UI components
- **Lucide React** for consistent iconography
- **class-variance-authority** and **clsx** for conditional styling

### Charts & Data Visualization
- **Recharts** for dashboard analytics and data visualization
- **Date-fns** for date manipulation and formatting

### Development Tools
- **TypeScript** for static type checking across the entire stack
- **ESBuild** for fast JavaScript/TypeScript compilation
- **PostCSS** with **Autoprefixer** for CSS processing
- **Replit-specific plugins** for development environment integration

The application is designed to be easily deployable and scalable, with clear separation of concerns between the client, server, and database layers. The architecture supports future enhancements like real-time features, mobile app development, and third-party integrations.

## Future Feature Roadmap

### Community & Social Features
- **Match Creation & Joining**: Users can create or join matches with others in their area
- **Sports Community Notifications**: Notify community members when new matches/events are created
- **Help Board**: Feature for finding and joining teams
- **Player Profiles & Skill Ratings**: Social features with comprehensive player profiles and skill-based ratings
- **One Unified Platform**: Single app for searching, booking, payments, and social engagement

### Enhanced Booking Experience
- **Real-time Availability**: Live court availability updates with instant booking confirmation
- **Calendar & Maps Integration**: Instant booking confirmation with seamless calendar and maps integration
- **Recurring Subscriptions**: Automatic weekly/monthly slot booking for regular players to save time and ensure availability

### Payment & Financial Features
- **In-app Payment Splitting**: Split payments with friends directly within the platform
- **S-Wallet System**: In-app wallet for easy recharges, auto-pay for recurring bookings, and seamless transactions
- **Coupons & Offers**: Comprehensive reward system including referral bonuses, consecutive booking discounts, student discounts, and freebies

### Event Add-ons & Services
- **Cab Booking Integration**: Direct cab booking to venues through the platform
- **Beverage Orders**: In-app beverage ordering for events and bookings
- **Equipment Services**: Equipment rentals and purchases directly through the platform
- **Complete Event Management**: End-to-end event planning and management capabilities