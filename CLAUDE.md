# CLAUDE.md

## Project Overview

Cipher Kids is an educational React web application that teaches children about cryptography through interactive cipher tools. It features a Netflix-style user interface with personalized profiles and supports Atbash, Caesar, Keyword, Pigpen, Rail Fence, and Vigenère ciphers.

## Development Commands

All commands should be run from the `/app` directory:

**Note**: Dependencies have been updated to resolve React 19 compatibility issues. The unused `recharts` dependency has been removed.

```bash
# Development
npm install          # Install dependencies
npm start           # Start dev server (http://localhost:5173)
npm run build       # Build for production
npm run preview     # Preview production build

# Quality Assurance
npm run lint        # ESLint checking
npm run format      # ESLint fix + Prettier formatting
npm run test        # Run Playwright tests

# Deployment
npm run deploy      # Build and deploy to Cloudflare Pages
```

## Architecture

### Technology Stack
- **React 19** with TypeScript and Vite 6.3.5
- **TanStack Router v1** for file-based routing with auto-code-splitting
- **React Aria Components** with Tailwind CSS 4.1.4 for accessible UI
- **Framer Motion v12** for educational animations
- **TanStack Query** for state management
- **Cloudflare Pages/Workers** for deployment

### Key Directories

```
app/src/
├── components/
│   ├── ui/              # React Aria component library (35+ components)
│   ├── cipher/          # Cipher-specific components
│   │   ├── results/     # Result display components
│   │   ├── shared/      # Shared cipher components
│   │   └── vigenere/    # Vigenère-specific components
│   └── theme/           # Theme management
├── context/             # React Context providers
├── hooks/               # Custom React hooks
├── routes/              # TanStack Router pages
│   └── ciphers/         # Individual cipher pages
└── utils/               # Utility functions & cipher algorithms
```

## Cipher Implementation

### Supported Ciphers
- **Atbash Cipher**: Ancient mirror alphabet cipher where A becomes Z, B becomes Y, etc.
- **Caesar Cipher**: Basic substitution with shift parameter
- **Keyword Cipher**: Substitution using keyword-generated alphabet
- **Pigpen Cipher**: Geometric substitution cipher using symbols from a grid
- **Rail Fence Cipher**: Write message in zigzag pattern, then read off row by row
- **Vigenère Cipher**: Polyalphabetic substitution with keyword

### Cipher Modes
Each cipher supports three modes:
- **Encrypt**: Convert plaintext to ciphertext
- **Decrypt**: Convert ciphertext to plaintext
- **Crack**: Attempt to break cipher without knowing key

### Algorithm Location
Cipher algorithms are implemented in `/src/utils/` with corresponding React components in `/src/components/cipher/`.

## User Management

### Profile System
- Netflix-style user profiles with single-letter initials (A, L, I, J, F)
- Local storage persistence for user preferences
- Configurable cipher access per user
- User-specific themes and settings

### User Context
The `UserContext` manages authentication state and user preferences. User data is persisted to local storage.

## Component Architecture

### UI Components
- Comprehensive React Aria Components library in `/components/ui/`
- All components are accessible and keyboard navigable
- Components support theme switching (dark/light/system)

### Cipher Components
- Modular components for each cipher type
- Shared components for common functionality (input/output, controls)
- Result display components with animations

## Theme System

### Theme Support
- User-specific theme preferences (dark/light/system)
- CSS class-based theme switching
- Theme persistence in user profiles

### Theme Context
The `ThemeContext` manages theme state and provides theme switching functionality.

## Testing

### Playwright Testing
- End-to-end tests using Playwright
- Tests cover cipher functionality and user interactions
- Run tests with `npm run test`

## Development Guidelines


- You have playwright, don't tell me what I should see in my browser until you've confirmed.


### Code Quality
- ESLint with TypeScript rules enabled
- React hooks linting configured
- Prettier formatting applied via `npm run format`
- Generated UI components in `/src/components/ui/` should not be manually edited

### TypeScript Configuration
- Strict TypeScript configuration with project references
- Path aliases configured for clean imports
- Separate configs for app and Node.js code

### Educational Focus
- Age-appropriate interface design
- Interactive learning through step-by-step animations
- Progressive difficulty curve (Atbash → Caesar → Keyword → Rail Fence → Vigenère → Pigpen)
- Historical context and educational explanations

## Deployment

### Cloudflare Configuration
- SPA deployment via Cloudflare Pages
- Configuration in `wrangler.jsonc`
- Assets served from `/app/dist/`
- Node.js compatibility enabled for build tools

### Build Process
- Vite handles bundling and optimization
- TanStack Router provides automatic code splitting
- Build artifacts output to `/app/dist/`

## Performance Considerations

- CSS animations are a lot more resource friendly that JS ones. For a background we should stick with css.

## Test Development Guidelines


- Be careful not to run playwright in a mode that starts a dev server all you'll be waiting a long time...


When creating E2E tests:

1. **Test incrementally** - Write and run each test as you develop it, don't write all tests then test at the end
2. **Examine the actual UI first** - Use headed mode or examine the application before making assumptions about features
3. **Start with basic tests** - Verify simple UI elements exist before testing complex interactions
4. **Be conservative about completion** - Don't claim tests are done until they're actually passing
5. **Match reality** - Sometimes fix the test to match the app, sometimes enhance the app to match the test expectation