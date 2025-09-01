# AutoMindMap

## Overview

AutoMindMap is a full-stack web application designed to transform learning through AI-powered YouTube video summaries. The application allows users to input YouTube video links and receive detailed, comprehensive summaries generated using Google's Gemini AI. Built with modern web technologies, it features user authentication, real-time data storage, and advanced AI integration to help students save time and retain more knowledge from educational video content.

The platform provides additional features like text explanation for complex concepts, bookmarking capabilities, and text-to-speech functionality to enhance the learning experience. Users can manage their summaries, search through their content, and access detailed analytics about their learning progress.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with React and TypeScript, utilizing Vite as the build tool and development server. The application follows a component-based architecture with:
- **UI Framework**: Radix UI components with Tailwind CSS for styling, providing a consistent and accessible design system
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation schemas
- **Design System**: Shadcn/ui components for consistent UI patterns

The frontend architecture emphasizes modularity with separate pages for different features (Home, Summary, Bookmarks, History, Profile) and reusable UI components. The Layout component provides consistent navigation and user interface elements across all pages.

### Backend Architecture
The server-side follows a Node.js/Express architecture with TypeScript:
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful API with organized route handling
- **Authentication**: Replit Auth integration with session management
- **Database Layer**: Drizzle ORM for type-safe database operations
- **AI Integration**: Google Gemini API for content generation and text explanation

The server architecture separates concerns with dedicated modules for database operations (storage.ts), AI functionality (gemini.ts), authentication (replitAuth.ts), and route handling (routes.ts).

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Neon Database as the hosting provider:
- **ORM**: Drizzle ORM for type-safe database queries and migrations
- **Schema Design**: Well-structured relational database with tables for users, summaries, bookmarks, and sessions
- **Session Storage**: PostgreSQL-backed session storage for authentication
- **Data Types**: Comprehensive schema with proper relationships and constraints

The database schema includes mandatory tables for Replit Auth compatibility (users and sessions) along with application-specific tables for summaries and bookmarks, with proper foreign key relationships.

### Authentication and Authorization
Authentication is handled through Replit's OAuth system:
- **Provider**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **Security**: HTTP-only cookies with secure settings for production
- **User Management**: Automatic user creation and profile management

The authentication system provides seamless integration with the Replit ecosystem while maintaining security best practices for session handling and user data protection.

## External Dependencies

### AI and Machine Learning
- **Google Gemini API**: Primary AI service for generating video summaries and text explanations
- **Model**: Gemini-2.5-flash for content generation with detailed prompting strategies

### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Replit Infrastructure**: Authentication, hosting, and development environment
- **Session Storage**: connect-pg-simple for PostgreSQL-backed session management

### Development and Build Tools
- **Vite**: Frontend build tool and development server with React plugin
- **TypeScript**: Type safety across both frontend and backend
- **Tailwind CSS**: Utility-first CSS framework for styling
- **ESBuild**: Backend bundling for production deployment

### Third-party Libraries and APIs
- **UI Components**: Extensive Radix UI ecosystem for accessible components
- **Data Fetching**: TanStack Query for server state management
- **Form Management**: React Hook Form with Zod schema validation
- **Styling**: Class-variance-authority for component variant management
- **Utilities**: Date-fns for date manipulation, clsx for conditional classnames

The application leverages a modern tech stack optimized for developer experience and production performance, with particular emphasis on type safety, accessibility, and AI-powered functionality.