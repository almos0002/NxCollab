# Canvas Collaboration App

## Overview

A full-featured collaborative canvas web application built with Next.js 15, Better Auth, and Excalidraw. Real-time collaborative drawing and diagramming with workspace management, role-based access control, version history, and an admin dashboard.

## Architecture

### Monorepo Structure
- `artifacts/canvas-app/` - Main Next.js 15 application (port 18724, proxy at `/`)
- `artifacts/api-server/` - Legacy Express API server (port 8080, proxy at `/api/healthz`)
- `lib/db/` - Drizzle ORM schema + PostgreSQL client

### Technology Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS v4, Lucide React
- **Auth**: Better Auth (email/password, cookie sessions)
- **Canvas**: Excalidraw (dynamically loaded, SSR disabled)
- **Database**: PostgreSQL via Drizzle ORM
- **Encryption**: AES-GCM via Web Crypto API (client-side)

## Database Schema (`lib/db/src/schema/`)

- `users` - User accounts with `isAdmin` flag for admin access
- `sessions`, `accounts`, `verifications` - Better Auth tables
- `workspaces` - Collaborative workspaces owned by users
- `workspace_members` - Role-based membership (owner/admin/member/viewer)
- `workspace_invites` - Invite tokens with expiry (7 days)
- `canvases` - Canvas documents within workspaces
- `canvas_versions` - Auto-saved version history (up to 50 per canvas)
- `activity_logs` - Audit log for workspace activity
- `app_settings` - Key-value app configuration (signup_disabled etc.)

## Key Features

### Authentication
- Email/password via Better Auth
- Cookie-based sessions (7 day expiry)
- First registered user is automatically promoted to admin (atomic SQL check)

### Role-Based Access
- **Owner**: Full control including delete workspace
- **Admin**: Manage members, create/edit canvases
- **Member**: Create and edit canvases
- **Viewer**: View-only access to canvases

### Canvas Editor
- Excalidraw integration (dynamic import, SSR disabled)
- Auto-saves every 10 seconds after changes (content-diffed to avoid redundant saves)
- Manual save button (only manual saves create version snapshots)
- Version history panel (last 50 versions)
- Version restore with confirmation warning dialog

### Admin Dashboard
- Toggle user registration on/off
- Promote/demote users to admin role
- View all registered users

### Invite System
- Generate invite links (valid 7 days)
- Links auto-join users to workspace with specified role
- Email invite form in workspace settings

## API Routes

All API routes are in `artifacts/canvas-app/src/app/api/`:
- `POST /api/auth/sign-up/email` - Register (via Better Auth)
- `POST /api/auth/sign-in/email` - Login (via Better Auth)
- `GET /api/auth/get-session` - Get current session (via Better Auth)
- `POST /api/workspaces` - Create workspace
- `POST /api/workspaces/[id]/canvases` - Create canvas
- `POST /api/workspaces/[id]/invite` - Generate invite link
- `GET/PATCH /api/canvases/[id]` - Get/update canvas content
- `GET /api/canvases/[id]/versions` - List versions
- `POST /api/canvases/[id]/versions/[versionId]/restore` - Restore version
- `POST /api/admin/users/[id]/role` - Toggle admin (admin only)
- `POST /api/admin/settings/signup` - Toggle signup (admin only)
- `PATCH /api/user/profile` - Update user profile

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (auto-provisioned)
- `BETTER_AUTH_URL` - Base URL for Better Auth (set to Replit dev domain)
- `PORT` - Service port (auto-set to 18724 for canvas-app)

## Development Notes

- The Replit proxy routes `/api/*` to the canvas-app on port 18724
- The legacy api-server only handles `/api/healthz`
- Better Auth `trustedOrigins: ["*"]` is set for development; restrict in production
- Excalidraw is dynamically imported with SSR disabled to avoid Node.js incompatibilities
- Dark/light/system theme stored in localStorage, applied via CSS variables

## UI Design

- Inter font, neutral black/white/gray palette, no gradients, no shadows
- Consistent `rounded-lg`/`rounded-xl` borders
- Custom Combobox component replaces all native select dropdowns
- Subtle CSS animations (`fade-in`, `slide-up`, `scale-in`)
- Split-panel auth pages with branded illustration panel
- Landing page at `/` with feature grid and CTAs
- Collapsible sidebar with localStorage persistence (`sidebar-collapsed` key)
- Profile section at top of sidebar with avatar/initials, name, and email
- Sidebar profile height matches canvas page header height (49px)
- Per-page metadata/titles for browser tab (e.g., "Dashboard — Canvas")

## Excalidraw CSS

- Global `* { border-color }` rule is reverted inside `.excalidraw` via `.excalidraw, .excalidraw *, .excalidraw *::before, .excalidraw *::after { border-color: revert; box-sizing: revert; line-height: revert; }`
- This prevents Tailwind's base styles from breaking Excalidraw's internal UI

## First Admin

The first registered user is automatically promoted to admin via an atomic SQL update in Better Auth's `databaseHooks.user.create.after`. No manual SQL required.
