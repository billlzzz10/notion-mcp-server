# AI Graphics Generator

## Overview

This is a full-stack web application that generates custom graphics (stickers, icons, and emojis) using AI. The application features a React frontend with TypeScript, an Express.js backend, and uses OpenAI's DALL-E API for image generation. The project is built with modern tooling including Vite for development, Tailwind CSS for styling, and shadcn/ui for component library.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite with hot module replacement
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Session Storage**: PostgreSQL session store
- **AI Integration**: OpenAI DALL-E 3 API for image generation
- **Build System**: esbuild for production bundling

### Data Storage
- **Primary Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Management**: Drizzle Kit for migrations
- **Fallback Storage**: In-memory storage implementation for development

## Key Components

### Database Schema
- **Users Table**: Stores user credentials and authentication data
- **Generations Table**: Stores generation requests and results including type, description, colors, style, and generated image URLs

### API Endpoints
- `POST /api/generate`: Creates new image generations using OpenAI
- `GET /api/generations/recent`: Retrieves recent user generations
- `GET /api/usage`: Returns user usage statistics and limits

### Frontend Components
- **TypeSelector**: Allows users to choose between stickers, icons, and emojis
- **StyleCustomization**: Provides controls for description, colors, and style preferences
- **ResultsDisplay**: Shows generated images with download functionality
- **UsageStats**: Displays monthly usage tracking
- **GenerationHistory**: Shows recent generations

### AI Integration
- **OpenAI DALL-E 3**: Generates high-quality images based on prompts
- **Smart Prompting**: Automatically enhances user descriptions with type-specific instructions
- **Batch Generation**: Creates multiple images per request (4 for stickers, 20 for icons/emojis)

## Data Flow

1. User selects generation type (sticker, icon, emoji) and customizes parameters
2. Frontend validates input and sends request to backend API
3. Backend constructs optimized prompts and calls OpenAI DALL-E API
4. Generated image URLs are stored in database along with generation metadata
5. Frontend displays results and updates usage statistics
6. Users can view generation history and download images

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **openai**: Official OpenAI API client for DALL-E image generation
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives for complex components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **lucide-react**: Icon library

### Development Tools
- **vite**: Fast development server and build tool
- **typescript**: Static type checking
- **tsx**: TypeScript execution for development
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error reporting

## Deployment Strategy

### Development
- Vite dev server with HMR on frontend
- tsx for running TypeScript backend directly
- Replit-specific plugins for enhanced development experience

### Production Build
- Frontend: Vite builds optimized React app to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js`
- Single Express server serves both API and static files
- Environment variables for database and OpenAI API configuration

### Database
- Development: Local PostgreSQL or Neon serverless
- Production: Neon PostgreSQL with connection pooling
- Migrations managed through Drizzle Kit

## Changelog

Changelog:
- July 07, 2025. Initial setup
- July 08, 2025. Added Google AI (Gemini) integration alongside OpenAI
- July 08, 2025. Enhanced color palette system with primary and secondary colors
- July 08, 2025. Reduced image generation count from 20 to 8 for icons/emojis for better performance
- July 08, 2025. Added AI provider selection (OpenAI vs Gemini) with automatic fallback
- July 08, 2025. Improved error handling with multilingual messages

## User Preferences

Preferred communication style: Simple, everyday language.