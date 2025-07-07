# Cipher Kids App

A fun, educational web application that teaches kids about cryptography and ciphers through interactive experiences.

**Live App:** [https://cipher-kids.hardbyte.workers.dev/](https://cipher-kids.hardbyte.workers.dev/)

![Cipher Kids App](https://example.com/placeholder-image.png)

## Features

- Interactive cipher tools with animations:
  - Caesar Cipher
  - Keyword Cipher
  - Vigenère Cipher
- "Netflix-style" user profiles for kids
- Educational explanations about how each cipher works
- Cipher cracking tools to demonstrate cryptanalysis
- Responsive design for desktop and mobile devices

## Quick Start

### Development

1. Clone the repository
2. Navigate to the app directory:
   ```bash
   cd app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```
5. Open your browser at `http://localhost:5173`

### Building for Production

```bash
cd app
npm run build
```

The built files will be in the `dist` directory.

## Deployment

This project is deployed on Cloudflare Pages. You can access the live application at: [https://cipher-kids.hardbyte.workers.dev/](https://cipher-kids.hardbyte.workers.dev/)
For more details on the deployment process, see the [deployment guide](app/DEPLOY.md).

## Project Structure

```
app/
├── src/
│   ├── components/    # Reusable UI components
│   ├── context/       # React context providers
│   ├── routes/        # Application routes and pages
│   ├── utils/         # Utility functions, including cipher implementations
│   ├── app.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── public/            # Static assets
└── dist/              # Build output (generated)
```

## Technologies

- React 19
- TypeScript
- TanStack Router
- React Aria Components
- Tailwind CSS
- Framer Motion for animations
- Vite for fast development and optimized builds

## Educational Value

Cipher Kids helps children:
- Understand the history and use of ciphers
- Learn about encryption and decryption concepts
- Develop critical thinking through code-breaking challenges
- Practice pattern recognition and problem-solving skills
- Explore the foundations of modern computer security

## License

MIT