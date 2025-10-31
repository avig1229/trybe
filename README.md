# Trybe

A platform for creators to organize ideas, build in public, and find momentum together. Project Valley is built and can be run locally for testing; Collective Pulse is going to be the next phase of app dev; the tribe function will be the reach goal for the coming semester.

## Core features

### Project Valley (implemented)
- **Project Management**: Create, view, and delete creative projects
- **Channel Organization**: Organize content within projects using flexible channels
- **Status Tracking**: Track projects through planning, active, completed, and paused statuses
- **Visual Organization**: Color-coded projects with intuitive filtering and search

### Collective Pulse (planned)
- **Progress Updates**: Share work-in-progress and solicit constructive feedback
- **Showcase Posts**: Highlight completed work and creative achievements
- **Collaboration Requests**: Find and connect with complementary creative partners
- **Community Engagement**: Like, comment, and save posts from fellow creators

### Tribes (planned)
- **Micro-Communities**: Join niche communities united by shared interests and methodologies
- **Creator-Led**: Tribes are created and managed by community members
- **Structured Guidelines**: Each tribe can establish its own rules and culture
- **Exclusive Content**: Access to tribe-specific resources and discussions

## Tech stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Real-time)
- **UI Components**: Radix UI primitives with custom styling
- **State Management**: React Context API
- **Authentication**: Supabase Auth with profile management
- **Database**: PostgreSQL with Row Level Security (RLS)

## Getting started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Git

### Step 1: Clone and Install

```bash
git clone https://github.com/your-username/trybe.git
cd trybe
npm install
```

### Step 2: Set Up Supabase

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Configure environment**
   - Create `.env.local` in the project root.
   - Add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Initialize database**
   - Open Supabase SQL Editor.
   - Run:
     - `enhanced-schema.sql`
     - `storage-setup.sql`

4. **Verify tables**
   - Confirm `profiles`, `projects`, `channels`, `blocks` exist.

### Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Test the Application

1. **Sign Up**: Create an account at `/auth/signup`
2. **Login**: Sign in at `/auth/login`
3. **Create Project**: Click "New Project" in Project Valley
4. **View Project**: Click any project to open detail view
5. **Manage Channels**: Create and delete channels on the project detail page
6. **Delete Project**: Use the trash icon on any project card

## Project structure

```
trybe/
├── src/
│   ├── app/
│   │   ├── auth/              # Authentication pages (login, signup)
│   │   ├── valley/            # Main application pages
│   │   │   └── [projectId]/   # Individual project detail page
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/               # Base UI components (Button, Card, etc.)
│   │   ├── navigation.tsx    # Main app navigation
│   │   ├── project-valley.tsx # Project Valley view
│   │   └── ...               # Other feature components
│   ├── contexts/
│   │   └── AuthContext.tsx   # Authentication state management
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts     # Supabase client setup
│   │       ├── server.ts     # Server-side Supabase client
│   │       └── queries.ts    # Database query functions
│   └── types/
│       └── index.ts          # TypeScript type definitions
├── enhanced-schema.sql        # Complete database schema
├── storage-setup.sql         # File storage configuration
└── README.md                 # This file
```

## Authentication

The app uses Supabase Auth with multiple authentication methods:

- **Email/Password**: Traditional login and signup
- **Magic Links**: Passwordless email authentication
- **Google OAuth**: One-click social login (will be implemented after this round of check-in)

### Profile Management

- Automatic profile creation on first login
- Extends Supabase auth users with creative information
- Stored in `profiles` within Supabase

## Database

### Core Tables

- **profiles**: Extended user profiles
- **projects**: Creative projects with status and visibility
- **channels**: Organization units within projects (not yet utilized in the frontend)
- **blocks**: Individual resources (images, links, text, files)
- **posts**: Community updates (not yet implemented, next iteration goal)
- **tribes**: Community groups (not yet implemented, project reach goal)

### Row Level Security (RLS)

- Users can read and write their own data
- Public projects readable by everyone
- Private projects restricted to the owner

## Current status

### Done

- **Authentication System**
  - Login/Signup with email and password
  - Profile creation and management
  - Protected routes and session handling

- **Project Valley Pt.1**
  - Create, view, and delete projects
  - Project filtering by status
  - Search functionality
  - Loading states and error handling
  - Responsive grid and list views

- **Project Management**
  - Individual project detail pages
  - Channel creation and deletion
  - Project organization structure

### In progress

- Block management (add content to channels to the project valley)
- File upload and storage

### Up next

- **Collective Pulse/ Post**: Community feed and engagement
- **Tribes**: Specialized community spaces, will be the reach goal for the coming sem
- Real-time updates and notifications

## Testing

### Manual Testing Checklist

1. **Authentication**
   - Sign up a new account
   - Login with credentials
   - Verify profile is created
   - Test protected route access

2. **Projects**
   - Create a new project
   - View project details
   - Delete a project
   - Verify persistence on refresh

3. **UI/UX**
   - Test responsive design on mobile
   - Verify loading states
   - Check empty states
   - Test search and filter functionality

## Troubleshooting

### Common Issues

**"Error creating project"**
- Confirm `projects` table exists
- Check RLS policies allow INSERT for authenticated users
- Verify `user_id` is being passed correctly

**Login not working**
- Ensure Supabase Auth is enabled
- Check email/password provider is configured
- Verify redirect URLs in Supabase settings

---

Trybe — cultivating collaborative flow and creative belonging.
