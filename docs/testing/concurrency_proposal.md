# Concurrency Testing Proposal for Trybe: Project Valley Focus

To ensure Trybe can handle a group of users interacting simultaneously in the **Project Valley** phase, we recommend a "Load Testing" approach using **k6**.

## 1. Why k6?
- **Developer-Friendly**: Scripts are written in JavaScript.
- **High Performance**: Can simulate dozens or hundreds of users testing the mandatory LoCommit flow simultaneously.
- **Auth Simulation**: Can simulate logged-in users via Supabase JWTs.

## 2. Test Scenarios (Project Valley Focus)
We should focus on the most "expensive" operations in the current build:

### A. The "Onboarding" Surge
- **Description**: Simulate 30 users landing on the platform, going through the intro flow, and creating their first project at the same time.
- **Metric**: Success rate of project creation and latency of the initial intro data fetch.
- **Risk**: Database write throughput for new project records.

### B. The "LoCommit" Peak (Daily Reset)
- **Description**: Simulate 20 users attempting to post their mandatory "Daily Update" at the exact same time (right after the 9:00 AM reset).
- **Metric**: DB lock contention and transaction speed for `posts` (type: daily_update).
- **Risk**: Simultaneous media uploads to Supabase Storage and associated DB triggers.

### C. Valley Navigation Load
- **Description**: Users repeatedly clicking through Channels and Blocks in their projects.
- **Metric**: Response times for nested queries (Projects -> Channels -> Blocks).
- **Risk**: Overhead of RLS (Row Level Security) on deeply nested content.

## 3. Implementation Plan
1.  **Install k6**: `brew install k6`.
2.  **Scripting**: Create a script that simulates the user journey:
    - Auth -> Fetch Intro -> Create Project -> Upload Daily Block.
3.  **Execution**: Run with 10 VUs (Virtual Users) to start, scaling to 50 VUs.

## 4. Key Metrics to Monitor
- **Database CPU & RAM**: Watch for spikes in the Supabase Dashboard.
- **Storage Bandwidth**: Monitor throughput for concurrent video/image uploads.
- **p95 Latency**: Ensure the "Unlock" action happens in under 500ms even under load.
