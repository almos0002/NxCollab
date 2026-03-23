# Canvas Collaboration App

## Overview

A full-featured collaborative canvas web application built with Next.js 15, Better Auth, and Excalidraw. Real-time collaborative drawing and diagramming with workspace management, role-based access control, version history, and an admin dashboard.

## Project Structure

This is a **Next.js project** running in a pnpm workspace on Replit. The app runs on port 5000 via the "Start application" workflow.

```
├── app/                      # Next.js App Router (pages, layouts, API routes)
│   ├── (app)/                # Authenticated app pages (dashboard, workspaces, canvas, etc.)
│   ├── api/                  # API route handlers
│   ├── auth/                 # Auth pages (sign-in, sign-up)
│   ├── invite/               # Invite token handling
│   ├── globals.css           # Global Tailwind + theme CSS variables
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── not-found.tsx         # 404 page
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── canvas/               # Excalidraw canvas components
│   ├── auth/                 # Auth forms
│   ├── workspace/            # Workspace management components
│   ├── admin/                # Admin dashboard components
│   └── settings/             # User settings components
├── hooks/                    # Custom React hooks
├── lib/
│   ├── db/                   # Database layer (Drizzle ORM + schema)
│   │   └── schema/           # PostgreSQL table definitions
│   ├── auth.ts               # Better Auth server config
│   ├── auth-client.ts        # Better Auth browser client
│   ├── session.ts            # Session helpers
│   ├── workspace.ts          # Workspace permission helpers
│   ├── encryption.ts         # AES-GCM client-side encryption
│   └── utils.ts              # Utility functions
├── public/                   # Static assets (favicon, OG image)
├── package.json              # Standalone dependencies (npm/yarn/pnpm)
├── next.config.ts            # Next.js config
├── tsconfig.json             # TypeScript config with @/* path alias
├── postcss.config.mjs        # PostCSS / Tailwind CSS v4
├── drizzle.config.ts         # Drizzle Kit config (DB migrations)
├── components.json           # shadcn/ui config
└── .env.example              # Environment variable template
```

## Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4, Lucide React
- **Auth**: Better Auth (email/password, cookie sessions)
- **Canvas**: Excalidraw v0.18 (dynamically loaded, SSR disabled, uses `excalidrawAPI` callback prop)
- **Database**: PostgreSQL via Drizzle ORM
- **Encryption**: AES-GCM via Web Crypto API (client-side)

## Database Schema (`lib/db/schema/`)

- `users` - User accounts with `isAdmin` flag for admin access
- `sessions`, `accounts`, `verifications` - Better Auth tables
- `workspaces` - Collaborative workspaces owned by users
- `workspace_members` - Role-based membership (owner/admin/member/viewer)
- `workspace_invites` - Invite tokens with expiry (7 days)
- `canvases` - Canvas documents within workspaces (includes `library_data` for per-canvas Excalidraw library, `deleted_at` for soft delete)
- `canvas_versions` - Auto-saved version history (up to 50 per canvas, skips duplicates)
- `workspaces` includes `deleted_at` column for soft delete
- `activity_logs` - Audit log for workspace activity
- `app_settings` - Key-value app configuration (signup_disabled, site_name, site_favicon, site_logo, default_workspace_limit, default_canvas_per_workspace_limit)
- `user_limits` - Per-user custom resource limits (workspace_limit, canvas_per_workspace_limit)

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and BETTER_AUTH_URL

# 3. Push database schema
npm run db:push

# 4. Start development server
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_URL` | Base URL of your app (e.g. `http://localhost:3000`) |

## Key Features

### Authentication
- Email/password via Better Auth
- Cookie-based sessions (7 day expiry)
- First registered user is automatically promoted to admin

### Role-Based Access
- **Owner**: Full control including delete workspace
- **Admin**: Manage members, create/edit canvases
- **Member**: Create and edit canvases
- **Viewer**: View-only access to canvases

### Canvas Editor
- Excalidraw integration (dynamic import, SSR disabled)
- Auto-saves every 10 seconds after changes
- Manual save button (creates version snapshots, skips if content unchanged)
- Version history panel (last 50 versions)
- Version restore with confirmation dialog
- Save/History buttons in page header navbar (not floating overlay)
- Per-canvas Excalidraw library persistence (saved to DB)
- Canvas background color and theme follow website dark/light theme

### Admin Dashboard
- Toggle user registration on/off
- Promote/demote users to admin role
- Edit user name/email (with duplicate email check)
- Delete users (with confirmation, cannot delete self)
- View all registered users
- Branding settings: site name, favicon URL, logo URL (reflected in browser tab, sidebar)
- Default resource limits: max workspaces per user (default 5), max canvases per workspace (default 10)
- Per-user custom limit overrides (from user management table)

### Workspace Member Management
- Workspace owners and admins can change member roles (admin/member/viewer)
- Workspace owners and admins can remove team members
- Owner role is protected (cannot be changed or removed)
- Role dropdown with inline change, remove button with confirmation dialog

### Soft Delete & Contextual Trash System
- Deleting workspaces, canvases, or notifications sets `deletedAt` instead of hard delete
- All list queries filter out soft-deleted items using `isNull(deletedAt)`
- Contextual trash bins (no centralized `/trash` page):
  - **Workspaces page**: "Trash" tab shows deleted workspaces owned by the user with restore/permanent-delete
  - **Workspace detail page**: "Trash" toggle shows deleted canvases within that workspace (owner/admin/member)
  - **Inbox page**: "Trash" tab shows deleted notifications with restore/permanent-delete
- Workspace delete also soft-deletes all child canvases
- API routes: `POST /api/trash/restore`, `POST /api/trash/permanent` (workspaces/canvases)
- Notification trash API: `POST /api/notifications/[id]/restore`, `POST /api/notifications/[id]/permanent`

### Popup Modals for Creation & Editing
- Create workspace/canvas via popup modal dialog (no separate pages)
- Edit workspace/canvas title and description via modal
- Reusable components: `components/shared/confirm-dialog.tsx`, `components/shared/resource-form-dialog.tsx`
- Delete confirmations use reusable ConfirmDialog (admin-actions, members-list, canvases-list, workspace detail)

### Resource Limits
- Default limits: 5 workspaces per user, 10 canvases per workspace (configurable by admin)
- Per-user custom limits override defaults (managed from admin user table)
- Limits enforced on workspace creation (`POST /api/workspaces`) and canvas creation (`POST /api/workspaces/[id]/canvases`)
- Helper functions in `lib/limits.ts`: `getUserLimits()`, `checkWorkspaceLimit()`, `checkCanvasLimit()`

### Search, Pagination, Sorting & Filtering
- Search bar on workspaces page, workspace detail (canvases), dashboard (recent canvases), and recent page
- Sorting on workspaces (name A-Z/Z-A, newest/oldest) and canvases (recently/oldest updated, name A-Z/Z-A)
- Role-based filtering on workspaces page (all/owner/admin/member/viewer)
- Pagination with page navigation (6 items per page for workspaces/canvases, 8 for dashboard, 10 for recent page)
- Grid/list view toggle with localStorage persistence
- Reusable components: `components/shared/search-bar.tsx`, `pagination.tsx`, `view-toggle.tsx`, `confirm-dialog.tsx`, `resource-form-dialog.tsx`

### Invite System
- Generate invite links (valid 7 days)
- Links auto-join users to workspace with specified role
- Invite notifications sent directly to user's in-app inbox if they have an account

### In-App Notification System (Inbox)
- `notificationsTable` stores per-user notifications with type, title, message, link, metadata, deletedAt (soft delete)
- Notification types: workspace_invite, role_changed, member_removed, canvas_deleted, canvas_created, member_joined, general
- Sidebar "Inbox" link with live unread badge (polls every 30s + instant update via custom events on read/delete)
- Inbox page (`/inbox`) with all/unread filter, mark-all-read, delete, and click-to-navigate
- Invite confirmation page: shows workspace name, role, inviter — user must Accept or Decline (no auto-join)
- Accept/Decline API routes: `POST /api/invites/[token]/accept` (transactional), `POST /api/invites/[token]/decline` (marks invite used)
- `lib/notification-events.ts` dispatches `notification-change` custom event for instant sidebar badge sync
- Notifications auto-created for: workspace invites, role changes, member removal, canvas creation/deletion, member joins
- Helper functions: `createNotification()` for single user, `notifyWorkspaceMembers()` for broadcasting to all members
- Schema: `lib/db/schema/notifications.ts`, helpers: `lib/notifications.ts`
- Canvas delete endpoint added: `DELETE /api/canvases/[id]`

## API Routes

All API routes are in `app/api/`:
- `POST /api/auth/sign-up/email` - Register (via Better Auth)
- `POST /api/auth/sign-in/email` - Login (via Better Auth)
- `GET /api/auth/get-session` - Get current session
- `POST /api/workspaces` - Create workspace
- `POST /api/workspaces/[id]/canvases` - Create canvas
- `POST /api/workspaces/[id]/invite` - Generate invite link
- `PATCH/DELETE /api/workspaces/[id]` - Edit/soft-delete workspace
- `POST /api/trash/restore` - Restore workspace/canvas from trash
- `POST /api/trash/permanent` - Permanently delete workspace/canvas
- `GET/PATCH/DELETE /api/canvases/[id]` - Get/update/soft-delete canvas content
- `GET /api/canvases/[id]/versions` - List versions
- `POST /api/canvases/[id]/versions/[versionId]/restore` - Restore version
- `GET /api/notifications` - List user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/[id]` - Mark notification as read
- `DELETE /api/notifications/[id]` - Soft-delete notification
- `POST /api/notifications/[id]/restore` - Restore notification from trash
- `POST /api/notifications/[id]/permanent` - Permanently delete notification
- `POST /api/notifications/read-all` - Mark all as read
- `PATCH/DELETE /api/workspaces/[id]/members/[memberId]` - Change role/remove member
- `POST /api/admin/users/[id]/role` - Toggle admin (admin only)
- `POST /api/admin/users/[id]/edit` - Edit user name/email (admin only)
- `POST /api/admin/users/[id]/delete` - Delete user (admin only)
- `POST /api/admin/settings/signup` - Toggle signup (admin only)
- `GET/POST /api/admin/settings/branding` - Get/set branding (admin only)
- `GET/POST /api/admin/settings/limits` - Get/set default resource limits (admin only)
- `GET/POST /api/admin/users/[id]/limits` - Get/set per-user resource limits (admin only)
- `PATCH /api/user/profile` - Update user profile

## UI Design

- Inter font, neutral black/white/gray palette
- Custom Combobox component replaces native select dropdowns
- Dark/light/system theme stored in localStorage
- Collapsible sidebar with cookie persistence (SSR-readable, no flash on load)
- Sidebar uses Suspense streaming with skeleton fallback for instant shell rendering
- Split-panel auth pages with branded illustration panel
