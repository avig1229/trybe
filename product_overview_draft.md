# 6. Product Overview

This section provides a granular breakdown of the technical architecture and the specific implementation details of Trybe's core modules, moving from the foundational infrastructure to the user-facing features.

## 6.1 Technical Infrastructure

### Frontend Architecture
The frontend is constructed on **Next.js 14** using the App Router, selected to ensure a robust, performance-oriented architecture from day one. I utilized a hybrid rendering approach: **React Server Components (RSC)** handle data fetching and initial layout rendering to drastically minimize client-side JavaScript bundles, while **Client Components** are sparingly used only for highly interactive elements, such as the Block Editor and the vertical Video Player. State management follows this hybrid model; global server state is synchronized via **React Query** (or native server actions), while complex local interactions—like the drag-and-drop interfaces—are managed efficiently with React Hooks (`useReducer`, `useContext`). Visually, the application implements a custom "Glassmorphism" design system built with **Tailwind CSS**. This "Calm" aesthetic, characterized by dark modes, subtle blur effects, and minimal borders, allows the user's colorful creative work to stand out without UI distraction.

### Backend & Middleware
Trybe leverages a **Serverless architecture** to maximize scalability and reduce DevOps maintenance overhead. **Supabase** acts as the primary Backend-as-a-Service (BaaS), managing Authentication, the PostgreSQL Database, and Object Storage. To ensure type safety and code cohesion, all data mutations—such as creating projects or uploading media—are executed via **Next.js Server Actions**, eliminating the need for a separate, disconnected API layer. Furthermore, I implemented custom **Edge Middleware** (`middleware.ts`) that intercepts requests before they reach the server. This layer handles critical session validation and executes the "LoCommit" logic, instantaneously redirecting locked users to the check-in page without loading the core application, ensuring the accountability loop is enforced at the network edge.

### Database Constraints & Security
The data layer is built on **PostgreSQL**, utilizing a normalized schema designed to handle the complex, hierarchical relationships of a creative workflow. The core structure is defined by **Profiles** (extended user data), which create **Projects** (the root containers for work). Inside projects, data is subdivided into **Channels** (organizational themes like "Inspiration" or "Drafts") and finally **Blocks** (atomic units of content like Text, Images, or Links). Security is enforced strictly at the database engine level using **Row Level Security (RLS)**. Policies are granularly defined—for example, "Users can only view Channels of Projects they own OR projects that are marked Public"—ensuring that data privacy is an architectural guarantee rather than an application-level afterthought.

---

## 6.2 Core Modules

### LoCommit: The Accountability Engine
**Ideation:** The "LoCommit" (Low-friction Commit) engine addresses the core insight that creative blocks often stem from a lack of momentum rather than a lack of skill. I needed a "forcing function" akin to a corporate daily standup, but automated for the solo creator to prevent stagnation.

**Implementation & Logic:** The system operates on a timezone-aware "active day" calculation. We anchored the "New Day" reset to **9:00 AM Taiwan Time (UTC+8)**, creating a natural deadline for the initial user base. The system's logic, encapsulated in `getDailyLockStatus(userId)`, queries the database for any `daily_update` post created after this reset time. If no update is found, the system returns an `isLocked: true` state. This drives the **Check-In Overlay**, a full-screen, non-dismissible component that "soft locks" the UX—users cannot navigate or view content until they post, though they remain logged in. To ensure quality, the client-side uploader enforces strict video validation, requiring vertical orientation (9:16) and a duration between 15-25 seconds using metadata checks. We instituted an **optimistic upload strategy** via Supabase Storage, allowing users to write captions while the heavy video file uploads in the background, significantly reducing friction.

### Project Valley: The Deep Work Dashboard
**Ideation:** "Project Valley" was conceived to solve "tool fragmentation." Creators often scatter their work across Pinterest (visuals), Notion (planning), and Slack (communication). Valley unifies these needs into a single dashboard that combines visual inspiration with structured hierarchy.

**Implementation & Logic:** The data structure follows a strict normalization: Project → Channels → Blocks. Unlike early prototypes that relied on unstructured JSON blobs, this relational model allows for powerful cross-project querying (e.g., "Show me all Image blocks across all projects"). The generic state of a project moves through a defined machine: *Planning → Active → Paused → Completed*. The **ProjectDashboard** component realizes this structure through three specialized views:
1.  **Overview (The Reel & Board):** A cinematic "Reel" view horizontally scrolls through all video updates to show motion progress, while "The Board" uses a masonry CSS layout to dynamically pile image blocks into an auto-generated moodboard.
2.  **Resources:** A file-system-like interface where users manage atomic Blocks within Channels.
3.  **Progress:** A chronological timeline of all `daily_updates`, preserving the history of the work.

### Collective Pulse: The Social Layer
**Ideation:** While traditional social networks suffer from "Survivorship Bias"—rewarding only the most polished, final work—Collective Pulse is designed to reward consistency. It turns the "messy process" into the primary unit of social currency.

**Implementation & Logic:** The feed logic emphasizes temporal context over algorithmic engagement. It queries strictly for `is_public=true` projects, ensuring private experimentation in "Valley" remains confidential. The centerpiece of this module is the **Contribution Graph** (`ContributionGraph.tsx`), a GitHub-style heatmap that visualizes a user's creative consistency. It calculates activity intensity on a 0-4 scale for each day, providing a gamified visual incentive to "don't break the chain." The feed UI itself is responsive, shifting from a single vertical column on mobile to a multi-column grid on desktop to optimize the viewing experience for the platform's vertical video content.

### Automated Portfolio Creation (V4 Roadmap)
**Ideation:** "Exhaust data"—the massive amount of video, text, and decision-making data generated during daily updates—is usually lost. This module aims to mine this data to bridge the gap between "messy process" and "polished portfolio."

**Implementation Strategy:** The planned logic involves aggregating the last 30 `daily_updates` of a completed project. We will transcribe the video audio to text and feed these transcripts, along with captions, into a Large Language Model (e.g., Gemini 1.5 Flash) with a system prompt to "Act as a technical writer." This will auto-generate a cohesive Case Study from the raw progress logs. Users will then access a "Review Mode" to refine this AI-generated draft using the Block Editor before publishing it to their profile.
