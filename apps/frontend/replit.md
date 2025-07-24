# Project Overview

This is a modern full-stack web application built with React, Express, and PostgreSQL. The application appears to be designed for product management with file upload capabilities, featuring a comprehensive UI component library and a robust backend API structure.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **File Handling**: Multer for multipart file uploads
- **Session Management**: Express sessions with PostgreSQL store

### Key Components

#### Database Schema
- **Products Table**: Comprehensive product management with fields for pricing, inventory, shipping, images, and status
- **Users Table**: Basic user authentication structure
- **File Storage**: Local file system storage in `/uploads` directory

#### API Structure
- RESTful API design with `/api` prefix
- Product CRUD operations
- File upload endpoints for product images
- Error handling middleware with structured responses

#### UI Components
- Complete component library based on Radix UI
- Consistent design system with CSS variables
- Responsive design with mobile-first approach
- Accessible components following ARIA standards

### Data Flow
1. **Client Requests**: React components use React Query to fetch data from Express API
2. **Server Processing**: Express routes handle business logic and database operations
3. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
4. **File Management**: Multer handles image uploads with validation and storage

### External Dependencies

#### Frontend Dependencies
- **React Query**: Server state management and caching
- **Radix UI**: Headless UI primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation

#### Backend Dependencies
- **Drizzle ORM**: Type-safe database operations
- **Neon Database**: Serverless PostgreSQL hosting
- **Multer**: File upload middleware
- **Express Session**: Session management

### Deployment Strategy

#### Development Environment
- **Build Tool**: Vite with hot module replacement
- **Development Server**: Express with Vite middleware integration
- **TypeScript**: Shared types between client and server
- **File Watching**: TSX for server-side TypeScript execution

#### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: ESBuild bundles server code for Node.js
- **Static Files**: Express serves both frontend assets and uploaded files
- **Database**: Drizzle migrations for schema management

#### Configuration Management
- Environment variables for database connection
- Separate client and server build processes
- Path aliases for clean import statements

### Architecture Decisions

#### Monorepo Structure
- **Problem**: Managing frontend and backend code separately
- **Solution**: Single repository with `client/`, `server/`, and `shared/` directories
- **Benefits**: Shared TypeScript types, simplified deployment, consistent tooling

#### Drizzle ORM Choice
- **Problem**: Type safety and developer experience with database operations
- **Solution**: Drizzle ORM with PostgreSQL dialect
- **Benefits**: Type-safe queries, excellent TypeScript integration, lightweight

#### Component Library Strategy
- **Problem**: Consistent UI across the application
- **Solution**: Shadcn/ui components with Radix UI primitives
- **Benefits**: Accessibility built-in, customizable, modern design patterns

#### File Upload Implementation
- **Problem**: Handling product image uploads securely
- **Solution**: Multer middleware with local storage and validation
- **Benefits**: Simple implementation, file type validation, size limits

This architecture provides a solid foundation for a scalable product management application with modern development practices and robust error handling.