# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. It uses Claude AI to generate React components on-the-fly, displays them in real-time using a virtual file system, and allows users to iterate on their designs through conversational AI.

## Development Commands

### Setup
```bash
npm run setup              # Install dependencies, generate Prisma client, and run migrations
```

### Development
```bash
npm run dev                # Start Next.js development server with Turbopack
npm run dev:daemon         # Start dev server in background, logs to logs.txt
```

### Build & Deploy
```bash
npm run build              # Build production bundle
npm start                  # Start production server
```

### Testing & Linting
```bash
npm run test               # Run Vitest tests
npm run lint               # Run ESLint
```

### Database
```bash
npx prisma generate        # Generate Prisma client
npx prisma migrate dev     # Create and apply migrations
npm run db:reset           # Reset database (WARNING: destroys all data)
npx prisma studio          # Open Prisma Studio GUI
```

## Architecture

### Virtual File System

The core of UIGen is a **Virtual File System** (`src/lib/file-system.ts`) that manages component files entirely in memory. No files are written to disk during component generation:

- **VirtualFileSystem class**: In-memory file tree with Map-based storage
- **Serialization**: Projects serialize to JSON and persist in SQLite database
- **AI Tool Integration**: The VFS implements text editor commands (view, create, str_replace, insert) that Claude uses to manipulate files

### AI Component Generation Flow

1. **Chat API** (`src/app/api/chat/route.ts`):
   - Receives chat messages and current file system state
   - Reconstructs VirtualFileSystem from serialized data
   - Streams responses from Claude (or mock provider if no API key)
   - Provides two AI tools:
     - `str_replace_editor`: Create/view/edit files with string replacement
     - `file_manager`: Rename/delete files and directories

2. **AI Provider** (`src/lib/provider.ts`):
   - Uses Anthropic Claude Haiku 4.5 model by default
   - Falls back to **MockLanguageModel** if no API key configured
   - Mock provider generates static Counter/Form/Card components in multiple steps

3. **System Prompt**: Located at `src/lib/prompts/generation.tsx` (not analyzed but imported in chat route)

### JSX Transformation & Preview

**JSX Transformer** (`src/lib/transform/jsx-transformer.ts`):
- Transforms TypeScript/JSX to browser-compatible JavaScript using Babel
- Handles import resolution (local files, npm packages via esm.sh, @/ alias)
- Creates import maps for ES module loading in the browser
- Generates blob URLs for transformed code
- Processes CSS imports and collects styles
- Returns syntax errors for display in preview

**Preview HTML Generation**:
- Injects Tailwind CDN for styling
- Uses ES module import maps to load transformed code
- Includes ErrorBoundary for runtime error handling
- Displays syntax errors prominently if transformation fails

### Database Schema (Prisma)

Located at `prisma/schema.prisma`:
- **SQLite** database at `prisma/dev.db`
- Prisma client generated to `src/generated/prisma/`
- **User model**: Authentication with bcrypt hashed passwords
- **Project model**: Stores name, serialized messages, and VFS data
- Projects can be anonymous (userId nullable) or owned by users
- Cascade deletion when users are removed

### Frontend Structure

- **Next.js 15 App Router** with React 19
- **Main entry**: `src/app/page.tsx` (home) and `src/app/[projectId]/page.tsx` (project view)
- **MainContent** (`src/app/main-content.tsx`): Orchestrates chat, preview, and code editor
- **Chat components**: `src/components/chat/` - message rendering, input, markdown
- **Preview components**: Monaco editor for code view, iframe for live preview
- **UI components**: shadcn/ui components in `src/components/ui/`

### Path Aliases

TypeScript path alias `@/*` maps to `src/*` (configured in `tsconfig.json`).

### Authentication

- **JWT-based auth** using jose library (`src/lib/auth.ts`)
- Anonymous users tracked via cookies (`src/lib/anon-work-tracker.ts`)
- Middleware (`src/middleware.ts`) handles session management
- Server actions in `src/actions/` for user/project operations

## Key Architectural Patterns

1. **In-Memory File System**: All component generation happens in memory via VirtualFileSystem, avoiding disk I/O
2. **Blob URL Strategy**: Transformed JavaScript creates blob URLs for browser import maps
3. **Tool-Based AI Interaction**: Claude manipulates files through structured tools (str_replace_editor, file_manager)
4. **Mock Provider Pattern**: Graceful degradation when API key unavailable
5. **Serialization/Deserialization**: VFS state persists to database as JSON, reconstructed on each request

## Testing

- **Vitest** with jsdom environment
- **React Testing Library** for component tests
- Test files colocated in `__tests__` directories
- Example tests in `src/components/chat/__tests__/` and `src/lib/__tests__/`
- Path resolution via vite-tsconfig-paths plugin

## Important Notes

- The project uses `NODE_OPTIONS='--require ./node-compat.cjs'` for Node compatibility
- Prisma client is generated to a custom location (`src/generated/prisma/`)
- Preview uses Tailwind CDN rather than build-time processing
- Import map strategy relies on esm.sh for third-party packages
