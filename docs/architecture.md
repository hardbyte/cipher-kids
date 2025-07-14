# Application Architecture Documentation

## 1. Overview

This document provides a comprehensive overview of the software architecture for the Cipher Kids web application. The architecture is designed to be modern, scalable, and maintainable, leveraging a stack of industry-standard tools and libraries to deliver a high-quality educational experience.

## 2. Technology Stack

### Frontend
-   **Framework**: React 19 with TypeScript
-   **Build Tool**: Vite 6.3.5
-   **Routing**: TanStack Router v1 (file-based, type-safe, with code-splitting)
-   **UI Components**: React Aria Components with Tailwind CSS 4.1.4 for accessible, unstyled primitives.
-   **Styling**: Tailwind CSS for utility-first styling, with `tailwind-variants` for creating component style variations.
-   **State Management**: TanStack Query (React Query) for server state management and caching.
-   **Animation**: Framer Motion v12 for declarative and performant animations.
-   **Linting & Formatting**: ESLint and Prettier, configured in `app/eslint.config.js`.

### Backend & Deployment
-   **Platform**: Cloudflare Pages for static asset hosting and serverless functions.
-   **Serverless Functions**: Cloudflare Workers (planned for persistent user profiles).
-   **Database**: Cloudflare D1 (planned for persistent user profiles).
-   **Deployment Configuration**: Managed via `wrangler.jsonc`.

## 3. Project Structure

The project is organized into a monorepo-like structure with the main application code residing in the `/app` directory.

```
/app
├── dist/              # Build output (generated)
├── public/            # Static assets (not present, but a standard location)
├── src/
│   ├── components/    # Reusable UI components
│   │   ├── ui/          # Core component library (React Aria based)
│   │   ├── cipher/      # Components specific to individual ciphers
│   │   └── theme/       # Theme management (ThemeProvider, useTheme)
│   ├── context/         # React Context providers (UserContext)
│   ├── hooks/           # Custom React hooks (useMediaQuery, useSampleMessages)
│   ├── routes/          # File-based routes for TanStack Router
│   │   ├── __root.tsx   # The root layout of the application
│   │   └── ciphers/     # Directory for individual cipher pages
│   ├── utils/           # Utility functions (cipher algorithms, debounce)
│   ├── app.tsx          # Main application component, sets up providers
│   └── main.tsx         # Application entry point
├── tests/             # Playwright E2E tests
├── package.json       # Project dependencies and scripts
└── vite.config.ts     # Vite configuration
```

## 4. Key Architectural Concepts

### File-Based Routing
-   The application uses **TanStack Router v1**, which automatically generates a type-safe route tree from the files in the `app/src/routes` directory.
-   This approach simplifies route management, enables automatic code-splitting per route, and provides strong type safety for route parameters and search params.
-   The root layout, including the header and main content area, is defined in `app/src/routes/__root.tsx`.

### Component Architecture
-   **UI Primitives**: The core UI is built upon **React Aria Components**. This provides a foundation of accessible, unstyled components (Button, Dialog, Slider, etc.) that are then styled with Tailwind CSS.
-   **Component Library**: The styled, reusable components are located in `app/src/components/ui`. This acts as the project's internal design system.
-   **Composition**: Cipher-specific pages are composed of these general UI components and more specialized components found in `app/src/components/cipher`.

### State Management
-   **UI State**: Local UI state is managed within components using React's built-in hooks (`useState`, `useEffect`).
-   **User State**: A custom `UserContext` (`app/src/context/user-context.tsx`) manages the currently active user profile, their preferences (like theme), and their enabled ciphers. This state is currently persisted to local storage.
-   **Server State**: **TanStack Query** is used for managing asynchronous operations and caching data. While there is no backend yet, it is set up and ready for when the persistent user profile feature is implemented.

### Theming
-   The application supports multiple themes (light, dark, matrix) via a CSS variable-based system.
-   The `ThemeProvider` (`app/src/components/theme-provider.tsx`) applies the current theme's class to the `<html>` element.
-   Theme-specific styles and color palettes are defined in `app/src/index.css`.
-   A `CipherPageContentWrapper` component is used to ensure content remains legible against dynamic backgrounds like the Matrix theme.

## 5. Implemented Ciphers

The application currently supports the following ciphers:

-   **Atbash Cipher**: Ancient mirror alphabet cipher where A becomes Z, B becomes Y, etc. No key needed.
-   **Caesar Cipher**: A simple substitution cipher that shifts letters by a fixed number of positions.
-   **Keyword Cipher**: Uses a keyword to create a mixed alphabet for substitution.
-   **Pigpen Cipher**: A geometric substitution cipher using symbols from a grid.
-   **Rail Fence Cipher**: Write message in zigzag pattern, then read off row by row.
-   **Vigenère Cipher**: A polyalphabetic substitution cipher using a keyword to determine shifts.

Each cipher has:
-   Its own route file in `/app/src/routes/ciphers/`
-   Algorithm implementation in `/app/src/utils/ciphers.ts`
-   Specialized visualization components in `/app/src/components/cipher/`
-   Support for encrypt, decrypt, and crack modes (where applicable)

## 6. Data Flow

1.  **Application Start**: `main.tsx` renders the `App` component.
2.  **Providers**: `app.tsx` sets up the `ThemeProvider` and `QueryClientProvider`.
3.  **Root Layout**: `__root.tsx` sets up the `UserProvider` and the main application layout (header, outlet). It also handles the core authentication logic, showing the `LoginScreen` if no user is active.
4.  **Routing**: TanStack Router mounts the appropriate route component from the `routes` directory into the `<Outlet />`.
5.  **User Interaction**: Components handle user input. State changes trigger re-renders. For user-specific settings, the `UserContext` is updated, which persists the changes to local storage.
