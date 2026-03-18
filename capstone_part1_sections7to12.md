
---

## 7. Development Timeline

Development ran from October 2024 to April 2025 in seven phases. Each phase's output became the foundation for the next.

| Phase | Dates | Deliverable | Key Files |
|-------|-------|-------------|-----------|
| **1. Schema & Auth** | Oct 2024 | 13-table PostgreSQL schema with 30+ RLS policies, Supabase Auth with OAuth | `supabase/*.sql`, `src/lib/supabase/` |
| **2. LoCommit Engine** | Nov 2024 | Daily lock mechanism (lock check query, 9AM UTC+8 reset, full-screen overlay) | `src/lib/daily-lock.ts`, `src/components/DailyCheckIn.tsx` (364 lines) |
| **3. Valley Foundation** | Nov–Dec 2024 | Project CRUD, channel nesting, block creation for 6 content types | `src/components/ProjectDashboard.tsx` (654 lines), `src/components/project-valley.tsx` |
| **4. Storage** | Dec 2024–Jan 2025 | 4-bucket storage system with upload validation, progress tracking, background uploads, and file path generation | `src/lib/storage/upload.ts` (303 lines, 8 functions), `src/lib/storage/validation.ts` |
| **5. Forest** | Jan–Feb 2025 | Canvas-based tree rendering (277 lines per tree), Fermat's Spiral spatial layout, viewport pan/zoom, hover preview cards, CRT overlay | `src/components/pulse/ProjectTree.tsx`, `ForestViewport.tsx`, `ProjectHoverCard.tsx`, `collective-pulse.tsx` |
| **6. Profiles & Polish** | Feb–Mar 2025 | Creator profiles (`/u/[username]`), contribution graph (5-level intensity calendar), theme toggle with SSR-safe hydration, navigation component (190 lines), responsive mobile layout | `src/components/ContributionGraph.tsx`, `navigation.tsx`, `ProfileHero.tsx`, `ProfileAbout.tsx` |
| **7. Testing & Docs** | Mar–Apr 2025 | 5-day structured beta with 4 testers, 15 migration scripts, 14 functional test cases, documentation | `docs/testing/`, `supabase/`, this report |

### Phase Detail: Storage (Phase 4) — The RLS Crisis

Phase 4 was the most technically significant because it triggered the RLS infinite recursion bug. The original storage policy design tried to check tribe membership to determine file access:

```sql
-- The problematic policy (simplified)
CREATE POLICY "Users can view tribe media"
ON storage.objects FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM tribe_memberships tm
        WHERE tm.user_id = auth.uid()
        AND tm.tribe_id = (
            SELECT tribe_id FROM projects WHERE id = ...  -- Circular!
        )
    )
);
```

The `tribe_memberships` table had its own policies that queried back to `profiles`, which queried `projects`, which queried `storage.objects` — creating a cycle. PostgreSQL detected this at query execution time and threw `infinite recursion detected`. The fix required 11 migration scripts over 3 weeks to redesign all storage policies to use direct ownership checks instead of cascading table queries, culminating in `fix_rls_comprehensive.sql` (3,595 bytes — the largest migration file).

### Phase Detail: Forest (Phase 5) — Three Iterations

The Forest visualization went through three architectural approaches before reaching the current implementation:

1. **SVG trees (abandoned):** Used `<svg>` elements for each tree. Worked for small numbers but couldn't handle 50+ trees without significant DOM overhead. Each tree required ~30 SVG elements, meaning 1,500+ DOM nodes for a full Forest.

2. **Single shared canvas (abandoned):** Drew all trees on one large canvas. Efficient for rendering but made hover detection and click targeting extremely difficult — canvas doesn't have DOM elements to attach event handlers to.

3. **Per-tree canvas with HTML overlay (shipped):** Each tree gets its own `<canvas>` element (240×480px CSS, scaled by `devicePixelRatio` internally), wrapped in a positioned `<div>`. The HTML wrapper handles mouse events (hover for `ProjectHoverCard`, click for navigation to `/projects/{id}`). The canvas handles only rendering. This separates the concerns: Canvas API for pixel-level visual fidelity, DOM for interaction.

---

## 8. User Testing

A 5-day structured beta was conducted with four independent testers (Tester 1–4). Each day had a specific focus:

| Day | Focus | What testers did |
|-----|-------|-----------------|
| 1 | Onboarding | Create account, complete onboarding flow, set up first project |
| 2 | Streak | Post first LoCommit update, experience the lock cycle |
| 3 | Organization | Build out Valley: create channels, add blocks, test media uploads |
| 4 | Depth | Browse the Forest, visit other testers' trees, post comments |
| 5 | Survey | Written survey + verbal exit interview |

### Feedback Summary

**What worked:**
- Tester 2 described the Forest as "the feature that most clearly differentiates this from other platforms"
- Tester 1 reported the LoCommit lock "changed when I documented my work" — they started documenting *during* creative sessions rather than after
- All four testers successfully created projects and navigated the Valley within the first session

**What didn't work:**
- Tester 3 found channel reordering unintuitive — expected drag-and-drop, got button-based reorder
- Tester 4 wanted to browse the Forest *before* posting — the binary lock (full access vs. no access) felt overly restrictive
- Testers 1 and 3 struggled to differentiate trees with similar colors in the Forest

### Post-Testing Revisions

| # | Issue Source | Description | Status | What Changed |
|---|-------------|-------------|--------|-------------|
| 1 | Tester 3 | Channel creation had no inline feedback | ✅ Fixed | Added inline validation + success toast |
| 2 | Tester 1, 3 | Trees hard to distinguish with similar colors | ✅ Fixed | Added per-project `TreeConfig` customization (6 line styles, color palettes) |
| 3 | Tester 4 | Lock is too rigid — can't browse before posting | 📋 Deferred | Noted for graduated access model in future |
| 4 | Tester 2 | No loading indicator for media uploads | ✅ Fixed | Added progress percentage (`uploadProgress` state) and "Ready" checkmark |
| 5 | All testers | No visual confirmation after successful LoCommit | ✅ Fixed | Added `CheckCircle2` icon with green "Ready" label |
| 6 | Tester 1 | Profile page didn't show contribution graph | ✅ Fixed | Added `ContributionGraph` component to `/u/[username]` |
| 7 | Tester 3 | Dark mode toggle didn't persist across sessions | ✅ Fixed | Theme saved to `localStorage` and hydrated on mount |
| 8 | Tester 2, 4 | Forest felt empty with only 4 testers | 📋 Deferred | Need seed data or minimum-project-count threshold |
| 9 | Tester 1 | Video duration constraints weren't clear upfront | ✅ Fixed | Added inline duration badge and descriptive error messages |
| 10 | Tester 4 | No way to search/filter in the Forest | 📋 Deferred | Planned for post-launch iteration |
| 11 | All testers | Mobile layout had overflow issues on Forest page | ✅ Fixed | Added responsive viewport constraints and touch support |
| 12 | Tester 3 | "What counts as a valid update?" was unclear | ✅ Fixed | Added descriptive copy: "15s (±1.5s) update" |
| 13 | Tester 2 | Withered tree state wasn't visually distinct enough | 📋 Deferred | Currently uses `grayscale(100%) opacity(0.5)` — may need stronger visual |
| 14 | Tester 1 | Wanted ability to re-watch past LoCommit videos | 📋 Deferred | Would require progress tab → media gallery |

9 of 14 issues were resolved. 5 were deferred with documented rationale — all deferred items require either new features (graduated lock, Forest search) or significant architectural changes (seed data system).

---

## 9. Strengths and Limitations

### Strengths

**Security is structural, not cosmetic.** 30+ RLS policies ensure that unauthorized data access is impossible even if the application code has bugs. A compromised API route cannot leak private projects — the database blocks the query before results are returned.

**The data model prevents corruption.** Foreign keys with cascade deletes, CHECK constraints, and unique constraints mean the database rejects invalid data at the engine level. Application code can be buggy without producing inconsistent state.

**The type system covers the full stack.** 22 TypeScript interfaces enforce consistent data shapes from the database mapping layer through the service module to the React components. A renamed field breaks at compile time, not at runtime.

**The Forest is novel.** No existing creative platform uses a spatial, generative visualization tied to real contribution data. Tester feedback confirmed this differentiation.

**The architecture is documented.** 15 migration scripts, 55 service functions, and the type definitions serve as technical documentation. A new developer could reconstruct the schema, API surface, and data flow from the codebase alone.

### Limitations

**Solo developer ceiling.** All code review was self-directed. The Forest went through three architectural iterations that a team could have evaluated against each other before building any of them.

**Single timezone.** The 9:00 AM UTC+8 reset creates inequitable daily windows for users in other timezones. A New York user's day starts at 8:00 PM. Per-user timezones would fix this but break the shared-rhythm design.

**Small test sample.** Four testers is enough to identify major usability issues but not enough for quantitative conclusions. The feedback is directional, not statistically significant.

**Missing features.** Tribes, in-app recording, portfolio generation, and real-time notifications exist only as schema definitions and type interfaces. The full social layer is incomplete.

**Free-tier constraints.** 500MB database + 1GB storage supports approximately 50 active creators. Scaling beyond this requires Supabase Pro ($25/month), CDN caching for media, and connection pooling — all documented in the migration history but untested under load.

**Accessibility gap.** The Forest is a canvas — invisible to screen readers. An accessible list-view alternative is needed for WCAG 2.1 AA compliance.

---

## 10. Future Work

Listed in order of implementation priority:

1. **Graduated LoCommit lock:** Allow read-only Forest browsing before posting. The current `isLocked` boolean needs to become a multi-state enum (`locked | read-only | unlocked`)
2. **Tribes (micro-communities):** The schema (`tribes`, `tribe_memberships`, 6 related query functions) exists. The UI does not. This is the largest remaining feature
3. **Forest search and filtering:** Text-based search + tag filters within the spatial view. The `search_projects()` database function already exists
4. **Per-user timezone:** Replace the fixed UTC+8 reset with user-configured timezones. Requires a new `timezone` column on `profiles` and per-user reset calculation in `daily-lock.ts`
5. **In-app video recording:** Currently users must record externally and upload. Adding browser-native recording via `MediaRecorder` API would reduce friction
6. **Real-time updates:** Use Supabase Realtime subscriptions to push Forest tree growth and new posts without page refresh
7. **Load testing:** Execute the k6 concurrency scenarios (onboarding surge, LoCommit peak, concurrent browsing) defined in the testing proposal

---

## 11. References

| Source | What it informed |
|--------|-----------------|
| Adobe (2022). *State of Create.* | Creator population (303M+) |
| Berklee (2019). *Artist Health Survey.* | Mental health impact of creative isolation |
| Mark et al. (2008). "The cost of interrupted work." *Proc. CHI.* | Context-switching cost (~23 min per tool change) |
| Kahneman & Tversky (1979). "Prospect Theory." *Econometrica.* | Loss aversion underpinning the LoCommit lock |
| O'Keefe & Nadel (1978). *The Hippocampus as a Cognitive Map.* | Spatial cognition for the Forest layout |
| Weiser & Brown (1997). "The Coming Age of Calm Technology." *Xerox PARC.* | Ambient awareness design for the Forest |
| Nielsen (2000). "Why You Only Need to Test with 5 Users." *NN/g.* | User testing sample size justification |
| Next.js Documentation. Vercel. | App Router, Server Components |
| Supabase Documentation. | Auth, Storage, RLS, Real-time |
| PostgreSQL Documentation. | RLS, GIN indexes, pg_trgm, PL/pgSQL |

---

## 12. AI Statement

There are two main ways I interact with AI in the current iteration of my project to improve my productivity.

1. **Figma AI (Interactive Prototyping):** I consulted Figma AI to assist me in turning the plain, static UI prototype I created into a semi-coded, interactive front end that I used to demo my ideation. The designs were produced by me, and the use of AI lies within the animation technicality that I am not as familiar with.

2. **Cursor & Antigravity (Code Development):** During my project code development phase, I consulted Cursor and Antigravity in a few ways to ensure the quality of my code. I utilized Cursor to fix plenty of hydration issues in the frontend of the project — this turned out to be extremely useful, as some bugs are small type errors that I struggled to catch, and Cursor worked well in this case. I also requested Cursor and Antigravity to help me populate boilerplates, basic set-ups, and query refinements. This helped me save plenty of time on building the foundation for multiple pages and shift focus to the key developments.

3. **Antigravity (Documentation):** I used Antigravity for documentation as I consulted it for the project README template structure and progress documentation run-through, which I utilized to document my project progress. Moreover, Antigravity helped structure the documentation, synthesize technical details from the codebase, and organize the technical stack.

4. **Grammarly:** Grammarly was used to check all written documents to ensure no spelling or grammatical errors are involved in the final submission.

The core concepts, design philosophy, and problem statements originate from me, and all content related to the full draft is designed by me as well.
