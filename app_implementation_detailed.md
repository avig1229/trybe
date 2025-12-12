# App Implementation & Technical Architecture

## Architecture Overview
The application is built on a **progressive complexity** model, starting with a robust single-player utility ("Project Valley") before layering on social dynamics ("Collective Pulse").

**Stack:**
*   **Frontend:** Next.js 15 (App Router) for server-side rendering and performance.
*   **Backend:** Supabase (PostgreSQL) with Edge Functions.
*   **Auth:** Supabase Auth with Server-Side Row Level Security (RLS).
*   **State/Data:** React Query (client-side) + Server Actions (mutations).

---

## Phase 1: The Foundation (Core Schemas & Auth)
**Goal:** Establish the data structures for "Project Valley" allowing deep nesting of content (Projects -> Channels -> Blocks) while ensuring secure access.

### Implementation Details
*   **Complex Schema Relations (`enhanced-schema.sql`)**: 
    *   Unlike flat todo-apps, Trybe uses a hierarchical structure. `projects` contain `channels`, which contain `blocks` (polymorphic content units: text, image, video).
    *   **Optimized Search:** Implemented custom PostgreSQL functions `search_projects` and `search_tribes` using `ts_vector` for performant full-text search directly in the database, avoiding the need for external search services.
    *   **Auto-Maintenance:** Database triggers (`update_tribe_member_count`, `update_updated_at_column`) automatically handle stats and timestamps to reduce application API overhead.

*   **Secure Auth (`src/lib/supabase/server.ts`)**:
    *   Utilizes `@supabase/ssr` `createServerClient` to handle session management via secure HTTP-only cookies, ensuring full compatibility with Next.js Server Components.

---

## Phase 2: The "Lock" & Media Engine (Behavioral Mechanics)
**Goal:** Enforce the "Process-First" philosophy through the **LoCommit** (Low-friction Commit) system and handle high-bandwidth user-generated content.

### The LoCommit Logic (`src/lib/daily-lock.ts`)
We implemented a custom time-based locking mechanism to gamify consistency:
*   **Timezone Aware:** The "Daily Reset" is calculated dynamically based on a fixed offset (UTC+8 for Taiwan) rather than user-local time, creating a synchronized "global beat" for the community.
*   **Logic:** `getDailyLockStatus` calculates the most recent 9:00 AM (TW time) and queries the DB for any `daily_update` post created *after* that timestamp. If none exists, the user is "Locked" out of browsing the feed.

### Storage & Security Hardening
**The "Infinite Recursion" Bug & Mitigation:**
During the implementation of media privacy, we encountered a critical RLS error (`infinite recursion`) where storage policies circularly queried `tribe_memberships`.
*   **The Fix (`supabase/fix_storage_policy.sql`):** We simplified the security model by decoupling storage permissions from complex relational queries. We shifted to a **bucket-level isolation strategy** (`project-files`), ensuring that file access checks (`auth.uid() = owner`) are atomic and performant, preventing database timeouts.

---

## Phase 3: The Social Layer (UI & Database Evolution)
**Goal:** Transform the user experience from a utility tool to a premium "Magazine" interface.

### UI Evolution: From "List" to "Global Reel"
The initial design utilized standard list-views common in project management tools. We refactored this into the **"Global Reel" (Magazine Layout)** to prioritize discovery:
*   **Visual-First Components (`src/components/collective-pulse.tsx`):** we transitioned from compact rows to immersive `Card` based layouts.
    *   **Contextual Badges:** Each post now prominently displays its origin (`Project: Name`, `Tribe: Name`) to give viewers immediate context.
    *   **Rich Media Placeholders:** The layout reserves `aspect-video` slots for media, ensuring that video/image content is the primary hook, not text.
    *   **Interaction Density:** Actions (Like, Comment, Save) were moved from a dropdown menu to a permanent, accessible toolbar at the bottom of each card to encourage engagement.

### Database Query Optimization (`performance-indexes.sql`)
To support the "Magazine" layout's heavy read-load, we revised our SQL strategy:
*   **Targeted Indexing:** We added specific B-Tree indexes on high-traffic foreign keys (`user_id`, `project_id`) and status columns (`is_public`). This reduces the query cost for the main feed from sequential scans to rapid index scans.
*   **Full-Text Search:** Enabled `pg_trgm` (trigram) extensions and GIN indexes on `name` and `description` fields. This allows the search bar to handle fuzzy matching (e.g., finding "desgn" when searching for "design") extremely efficiently without external dependencies like Algolia.
