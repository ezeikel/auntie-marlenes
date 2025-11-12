# Auntie Marlene's Mobile App

A React Native mobile application built with Expo for the Auntie Marlenes e-commerce store.

## Tech Stack

- **Framework**: Expo 54 with Expo Router
- **Language**: TypeScript
- **Styling**: NativeWind 4 (Tailwind CSS for React Native)
- **State Management**: TanStack Query + Zustand + Context API
- **Authentication**: Custom backend auth with Google, Apple, Facebook sign-in
- **Backend**: Shopify Storefront API (GraphQL)
- **Analytics**: PostHog
- **Error Monitoring**: Sentry
- **UI Components**: Custom components with FontAwesome Pro icons

## Features

- ✅ Authentication (Google, Apple, Facebook, Magic Link)
- ✅ Home screen with product carousels
- ✅ Search with real-time product filtering
- ✅ Product detail with image carousel
- ✅ Shopping bag (cart)
- ✅ Saved items (wishlist)
- ✅ Account management
- ✅ Haptic feedback for interactions
- ✅ Native share functionality
- ⏳ Offline support (planned)
- ⏳ Push notifications (planned)
- ⏳ Native checkout with Shopify Checkout Sheet Kit (planned)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+
- Expo CLI
- iOS Simulator (macOS) or Android Emulator

### Installation

1. Install dependencies:

\`\`\`bash
pnpm install
\`\`\`

2. Copy environment variables:

\`\`\`bash
cp .env.example .env
\`\`\`

3. Configure your environment variables in `.env`

### Development

Start the development server:

\`\`\`bash
pnpm dev              # iOS
pnpm dev:android      # Android
\`\`\`

### Building

#### Development Build

\`\`\`bash
pnpm eas:build:development
\`\`\`

#### Preview Build

\`\`\`bash
pnpm eas:build:preview:ios       # iOS
pnpm eas:build:preview:android   # Android
\`\`\`

#### Production Build

\`\`\`bash
pnpm eas:build:production
\`\`\`

## Project Structure

\`\`\`
apps/mobile/
├── app/                         # Expo Router app directory
│   ├── (authenticated)/         # Protected routes
│   │   ├── (tabs)/             # Bottom tab navigation
│   │   │   ├── index.tsx       # Home screen
│   │   │   ├── search.tsx      # Search screen
│   │   │   ├── bag.tsx         # Shopping bag
│   │   │   ├── saved.tsx       # Saved items
│   │   │   └── account.tsx     # Account screen
│   │   └── product/[handle].tsx # Product detail
│   ├── index.tsx               # Landing/redirect
│   ├── sign-in.tsx             # Authentication
│   └── _layout.tsx             # Root layout
├── components/                  # Reusable components
├── contexts/                    # React Context providers
├── hooks/                       # Custom hooks
├── lib/                         # Utilities and API clients
├── constants/                   # Constants and config
└── providers.tsx               # Provider hierarchy
\`\`\`

## Shared Packages

The mobile app uses shared packages from the monorepo:

- **@auntie-marlenes/types**: Shared TypeScript types
- **@auntie-marlenes/shopify**: Shopify GraphQL queries and adapters
- **@auntie-marlenes/constants**: Shared constants and configuration

## Design System

The app follows the Auntie Marlenes brand guidelines:

- **Colors**: Warm earth tones (Cocoa, Terracotta, Warm Sand, Sage Green)
- **Fonts**: Inter (sans-serif), Playfair Display (serif)
- **Spacing**: Consistent padding and margins using Tailwind
- **Components**: Custom components with haptic feedback

## Authentication Flow

1. User opens app → Checks for session token
2. If authenticated → Navigate to Home
3. If not authenticated → Navigate to Sign In
4. User signs in via Google/Apple/Facebook/Magic Link
5. Session token stored in Secure Store
6. User identified with PostHog & Sentry

## API Integration

### Shopify

- GraphQL queries via graphql-request
- Product catalog, search, cart management
- Type-safe with shared types package

### Backend

- Custom API for authentication
- User management
- Saved items persistence

## Scripts

- `pnpm start` - Start Expo development server
- `pnpm dev` - Start on iOS simulator
- `pnpm dev:android` - Start on Android emulator
- `pnpm lint` - Run ESLint
- `pnpm check-types` - Type check with TypeScript
- `pnpm prebuild` - Generate native directories
- `pnpm env:pull` - Pull environment variables from EAS

## License

Private - All rights reserved
