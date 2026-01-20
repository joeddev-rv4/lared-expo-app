# La Red Inmobiliaria

## Overview

La Red Inmobiliaria is a real estate network mobile application built with Expo React Native. The app follows an Airbnb-inspired design aesthetic, providing a premium marketplace experience for browsing, favoriting, and listing properties. It features a community-driven approach with a prominent floating action button for quick listing creation.

The application targets iOS, Android, and Web platforms from a single codebase, with platform-specific adaptations where necessary.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Expo SDK 54 with React Native 0.81
- Uses React 19 with the new React Compiler enabled
- Expo Router alternative: React Navigation (native stack, bottom tabs, drawer navigators)

**Navigation Structure**:
- Root Stack Navigator handles auth flow (Onboarding → Login → Main)
- Drawer Navigator wraps the main content for side menu access
- Bottom Tab Navigator with 5 tabs: Explore, Favorites, Add Listing (FAB), Profile, Achievements
- Each tab has its own stack navigator for screen hierarchy

**State Management**:
- TanStack React Query for server state and caching
- Local component state with React hooks
- AsyncStorage for persistent client-side data (onboarding status, favorites, user profile)

**UI/UX Patterns**:
- Airbnb-inspired color scheme (primary: #FF5A5F)
- Themed components supporting light/dark mode via `useTheme` hook
- Reanimated for smooth animations
- Haptic feedback via expo-haptics
- Platform-specific screens for web (OnboardingScreen.web.tsx, LoginScreen.web.tsx)

**Path Aliases**:
- `@/` maps to `./client/`
- `@shared/` maps to `./shared/`

### Backend Architecture

**Server**: Express.js (v5) running on Node.js
- TypeScript with tsx for development
- HTTP server with CORS configured for Replit domains
- Designed for REST API endpoints prefixed with `/api`

**External API Integration**:
- Connects to `plataforma.controldepropiedades.com/api` for property data
- Uses API key authentication
- Maps external property data to internal Property interface

### Data Layer

**ORM**: Drizzle ORM with PostgreSQL dialect
- Schema defined in `shared/schema.ts`
- Currently has a basic users table with UUID primary keys
- Uses drizzle-zod for schema validation

**Current Storage**:
- In-memory storage implementation (`MemStorage` class) for development
- AsyncStorage for client-side persistence (favorites, user profile, listings)

### Build & Development

**Development Scripts**:
- `expo:dev` - Runs Expo development server with Replit domain configuration
- `server:dev` - Runs Express server with tsx
- `db:push` - Pushes Drizzle schema changes to database

**Production Build**:
- `expo:static:build` - Custom build script for static web export
- `server:build` - Bundles server with esbuild
- `server:prod` - Runs production server

## External Dependencies

### Third-Party APIs
- **Property Data API**: `https://plataforma.controldepropiedades.com/api`
  - Provides property listings, projects, and images
  - Requires API key authentication

### Database
- PostgreSQL (via Drizzle ORM)
- Connection configured through `DATABASE_URL` environment variable

### Key Libraries
- **expo-image**: Optimized image loading
- **react-native-reanimated**: Smooth animations
- **react-native-gesture-handler**: Touch gesture handling
- **expo-blur/expo-glass-effect**: Visual effects
- **@react-native-async-storage/async-storage**: Local data persistence

### Fonts
- Nunito (via @expo-google-fonts/nunito)

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `EXPO_PUBLIC_DOMAIN` - Public domain for API calls
- `REPLIT_DEV_DOMAIN` - Development domain (Replit-specific)