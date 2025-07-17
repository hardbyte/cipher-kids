# Theme System Documentation

## 1. Overview

This document outlines the theming system implemented in the Cipher Kids application. The system is designed to be flexible and maintainable, allowing for easy application of different visual themes, including those with dynamic, animated backgrounds. It ensures that content remains legible and visually consistent regardless of the active theme.

## 2. Core Concepts

### a. Theme Context (`app/src/components/theme/theme-context.ts`)
-   Defines the available themes in a `Theme` type (e.g., `light`, `dark`, `matrix`, `emoji`).
-   Provides a React Context for accessing and setting the current theme throughout the application. The `useTheme` hook provides easy access to this context.

### b. ThemeProvider (`app/src/components/theme/theme-provider.tsx`)
-   Wraps the application's root component (`__root.tsx`).
-   Manages the current theme state, applying the appropriate CSS class (e.g., `.matrix`, `.emoji`) to the `<html>` element.
-   Persists the user's theme preference to local storage, ensuring it is retained across sessions.

### c. CSS Variables (`app/src/index.css`)
-   Global CSS variables define the color palette for each theme. Each theme class (`.dark`, `.matrix`, `.emoji`) overrides the default `:root` variables.
-   **`--bg`**: The primary background color for the entire application. For dynamic themes like Matrix and Emoji, this is the background that the animation plays on.
-   **`--fg`**: The primary foreground (text) color.
-   **`--content-block-bg`**: A crucial variable for ensuring content legibility.
    -   For standard themes (`light`, `dark`), this variable typically defaults to `var(--bg)`.
    -   For dynamic themes (`matrix`, `emoji`), this is set to a semi-transparent color (e.g., `rgba(0, 0, 0, 0.8)` for Matrix, `rgba(255, 255, 255, 0.9)` for Emoji) to allow the animated background to be subtly visible behind content blocks without sacrificing readability.

### d. Animated Background Components
-   Components like `MatrixBackground` and `EmojiBackground` are responsible for rendering the animated effects.
-   They are conditionally rendered in the root layout based on the active theme.
-   They use a `z-index: -1` to ensure they always appear behind the main application content.

### e. CipherPageContentWrapper (`app/src/components/cipher/CipherPageContentWrapper.tsx`)
-   **Purpose**: A shared component that wraps the main content sections of the cipher pages. Its primary role is to apply the correct background styling based on the active theme.
-   **Implementation**:
    -   It uses the `useTheme` hook to detect the current theme.
    -   If the theme is `matrix` or `emoji`, it applies `bg-[var(--content-block-bg)]` to its container, creating the semi-transparent effect.
    -   For all other themes, it applies a standard, opaque `bg-bg`.
-   **Benefit**: This component centralizes the styling logic for content blocks, ensuring a consistent look and feel across all cipher pages and guaranteeing readability against complex backgrounds.

## 3. How It All Works Together

1.  **Theme Selection**: A user selects a theme (e.g., "Emoji") via the `ThemeSwitcher`.
2.  **Context Update**: The `ThemeProvider` updates its state and applies the `.emoji` class to the `<html>` element.
3.  **CSS Variable Application**: The browser applies the CSS variables defined under the `.emoji` scope in `index.css`. The `--content-block-bg` is now set to `rgba(255, 255, 255, 0.9)`.
4.  **Background Rendering**: The `EmojiBackground` component is rendered by the root layout, displaying the floating emoji animation.
5.  **Content Rendering**: On a cipher page (e.g., `/ciphers/caesar`), the main content is wrapped by `<CipherPageContentWrapper>`. This wrapper reads the theme, sees it's "emoji", and applies the `bg-[var(--content-block-bg)]` style, resulting in the semi-opaque white background that makes the text readable over the animation.
6.  **Home Page Exception**: The cards on the home page do not use the `CipherPageContentWrapper`. Instead, they use the standard `bg-bg` class directly, giving them a solid, opaque background that completely blocks the animation. This is an intentional design choice to differentiate the main dashboard from the interactive cipher tool pages.
