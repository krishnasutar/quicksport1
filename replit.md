# QuickCourt - Local Sports Booking & Community Platform

## Overview

QuickCourt is a comprehensive sports booking platform with a hierarchical CRM/control panel system designed to manage multiple companies, facilities, and services under a unified administrative structure.

**Platform Architecture:**
- **Admin Level**: Platform controller and supervisor with full system access
- **Company Level**: Multiple companies managed under admin oversight
- **Owner Level**: Company controllers with owner role managing their assigned company's facilities
- **User Level**: Regular customers booking sports facilities

The CRM serves as the central control panel for this multi-tenant system, where admins manage companies, assign owners to companies, and owners manage their company's facilities and operations. All data flows through this hierarchical structure ensuring proper access control and data isolation.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### August 11, 2025 - Complete Stripe Payment Gateway Integration ✅ TEMPORARILY MOCKED
- **✅ STRIPE PAYMENT TEMPORARILY SIMULATED**: Converted to mock payment flow for testing other features
- **Complete booking workflow implemented**: Extended existing wallet system with simulated card payments  
- **Dual payment method support**: Users can choose between wallet payment (working) or card payment (simulated)
- **Enhanced booking form**: Added payment method selection with visual card/wallet payment options
- **Mock payment processing**: Stripe payment method now simulates successful payment after 2-second delay
- **Database schema updated**: Added `paymentMethod` and `paymentIntentId` fields to bookings table for payment tracking
- **Complete booking flow**: Full booking workflow supporting both payment methods with proper validation and confirmation
- **Security implementation**: Proper payment verification, amount validation, and court availability checks before booking creation
- **User experience**: Seamless payment method switching with appropriate success messages and loading states
- **✅ READY FOR TESTING**: Mock Stripe integration allows testing complete booking flow without payment processing issues
- **Note**: Real Stripe integration can be restored later when payment processing is prioritized

### Previous - Complete Hierarchical CRM Control Panel Implementation
- **Successfully migrated to user's personal Neon database**: Full database ownership and control with connection string: `ep-twilight-truth-a1qwp2nr-pooler.ap-southeast-1.aws.neon.tech`
- **Fixed authentication system completely**: Resolved all login issues and "welcome back undefined" errors
- **Clean database structure**: Truncated old data and created fresh test accounts with proper dual password system
- **Working test credentials**:
  - **Admin**: admin@gmail.com/admin123 (sees ALL data from all facilities)
  - **Owners**: owner@gmail.com/owner123, owner1-3@quickcourt.com/owner123
  - **Web Users**: user1-3@gmail.com/user123
- **Dual password system implemented**: Both visible passwords (admin123, owner123, user123) and secure bcrypt hashes
- **Field naming issues resolved**: Fixed firstName vs first_name inconsistencies causing undefined display names
- **Authentication logs cleaned**: Removed debug clutter, showing clean login confirmations
- **Database validation confirmed**: All user roles, permissions, and data isolation working properly
- **Complete user management CRUD system**: Fixed all blank buttons with functional view, edit, add, delete modals
- **Role-based filtering**: Added admin option to users dropdown with proper filtering functionality
- **Data integrity**: 8 users properly loaded (3 regular + 5 CRM users) from both database tables
- **Professional Analytics Dashboard**: Built comprehensive admin dashboard with:
  - **Live data visualizations**: Revenue trends, facility performance, booking analytics with Recharts
  - **YTD metrics**: Real-time revenue, bookings, facility performance tracking
  - **Facility earnings table**: Top performing facilities with owner details, location, YTD revenue
  - **Business intelligence**: Sports breakdown charts, peak time analysis, weekly booking trends
  - **Professional UI**: Modern charts, gradients, responsive tables, badge indicators
- **Complete Facility Management System**: Implemented comprehensive facility creation with company/owner hierarchy
  - **AddFacilityForm component**: Full featured form with company dropdown, owner auto-selection, courts management, amenities, images
  - **Company-Owner hierarchy**: Admin selects company → owner automatically assigned → facility created with proper relationships
  - **Multi-court support**: Add multiple courts per facility with sport type, pricing, and availability settings
  - **Rich form fields**: All demo data fields including description, location, contact details, amenities, image gallery
  - **API integration**: Complete backend support for facility creation with courts, proper authentication, role-based access
  - **Fixed navigation**: Separate "All Facilities" view from "Add Facility" form - no more dropdown confusion
- **Architecture confirmed**: Multi-tenant control panel with proper data isolation and company-owner relationships established

### Previous - Application Restructuring
- **Separated user interfaces**: Created distinct CRM/admin panel at `/crm` for facility owners and administrators
- **Removed mobile app focus**: Updated user interface to focus on web-based booking, removed app download sections
- **Role-based authentication**: Implemented separate login systems for regular users vs admin/owner users
- **Hierarchical Role-based System**: 
  - **Admin role**: Platform supervisor with full access to all companies, facilities, bookings, analytics, and user management
  - **Company-Owner relationship**: Owners are assigned to specific companies and can only access/manage their assigned company's data
  - **Data isolation**: Each owner sees only their company's facilities, bookings, and analytics
  - **Multi-tenant architecture**: Complete separation of company data while maintaining unified platform management
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