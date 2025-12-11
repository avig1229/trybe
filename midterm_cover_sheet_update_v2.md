# Midterm Deliverables Cover Sheet

**Name:** Min-Kuan (Avi) Gu
**Current assignment:** Midterm Deliverables (Update)
**Capstone title:** Trybe – An online approach to cultivating collaborative Flow & Creative Belonging. From indi-creator, for indi-creators.

## Abstract
This proposal outlines "Trybe," a full-stack digital platform designed to address the pervasive challenges of isolation, disorganized ideation, and limited collaborative support faced by creators during their iterative creative processes. Trybe aims to foster vibrant, supportive communities—termed "Tribes"—by providing intuitive tools for structured content/portfolio organization and dynamic project sharing. By cultivating an environment conducive to collaborative flow and mutual encouragement, Trybe seeks to empower creators to navigate their artistic journeys more effectively and realize their ambitious projects through authentic connections.

## Confirmations
- [x] I have read the Capstone Handbook.
- [x] I have updated my Capstone information in this sheet using this form.
- [x] I understand the systems/processes that my group will be using.

## Links to working files
*Note: Please update the links below if they have changed.*

- **MAIN MIDTERM Documentation:** [Notion Link](https://avigu.notion.site/Mid-Term-Blog-Post-29d2fab2f3cd805c9ca6c8dd7076547b?source=copy_link)
- **Project summary video:**
    - Front-end update: [Loom Link](https://www.loom.com/share/f8f99c371c404414aec36d76799d24ea)
    - Back-end/Login update: [Loom Link](https://www.loom.com/share/b27403a7c6b7476ba8c5a0149a3ab423)
- **Main folder(s):** [Notion Link](https://www.notion.so/avigu/Capstone-Hub-1d02fab2f3cd80e2a68af7431906610f?source=copy_link)
- **Paper/writeup:** [Google Doc](https://docs.google.com/document/d/1AWIqbxKTgMgQ8g2DAb3TSMNnW9qn9MBegBeflLPahXc/edit?tab=t.0#heading=h.rmkkkaxzmh1t)
- **Slides, images:** [Figma](https://www.figma.com/design/KkqQ1Y37WkopNm7pNOk3vV/Trybe-Protospace?node-id=0-1&t=dGOWlacKwCNoMI5W-1)
- **GitHub:** [https://github.com/avig1229/trybe.git](https://github.com/avig1229/trybe.git) (All current dev pushed here)
- **HC & LO plans:** [Notion Link](https://avigu.notion.site/2732fab2f3cd8017aa27eefea2f6b2e8?v=2732fab2f3cd803f8027000c2e6d2ed2&pvs=73)
- **Planning & progress tracking:** [Notion Link](https://avigu.notion.site/1d02fab2f3cd81208a56eebed7857570?v=2732fab2f3cd809a9804000cc16c9deb)

## Summary of all changes and progress since last assignment

**Current Status: Full Draft Implementation**
I have reached a significant milestone by completing the **full functional draft** of the application. This moves beyond the initial "Project Valley" baseline into a comprehensive, working platform that unites individual project management with community interaction.

**Key Feature Implementations:**
1.  **LoCommit System & Commit Board:** Designed and implemented the "LoCommit" (Low-friction Commit) system, which tracks creative progress through a "Contribution Graph" style visualization. This heatmap allows users to visualize their daily momentum and creative streaks, encouraging consistent output.
2.  **Magazine Layout ("Global Reel"):** Developed a new, visually rich "Magazine" layout for the community feed. This feature aggregates project updates into a horizontal, scrollable "Global Reel" that highlights video and media content in a premium, immersive format.
3.  **Advanced Upload Functions:** Fully debugged and finalized the media upload pipeline. The system now supports robust video and material uploads with specific duration checks (15-25s for daily checks) and validation, ensuring the "portfolio" aspect of Trybe is fully functional.
4.  **User Profile Customization:** Implemented a complete profile system where users can customize their creative identity, including bio, location, portfolio links, and an "Open to Collaborate" status badge to facilitate matching.
5.  **Channels & Categorization:** Rolled out the structure for content channels (via Tribes and specific post types like Progress, Questions, and Showcase), allowing for organized discourse and targeted community support.

**Development Note:** While the "Collective Pulse" foundation is laid, the primary focus has been verifying this "Full Draft" state—ensuring that the core loop of *Creating -> Uploading -> tracking (LoCommit) -> Displaying (Magazine)* is seamless.

## Brief reflection on my progress and process so far
I am extremely satisfied with the shift from planning to shipping this **Full Draft**. Since the last update, I have successfully connected the disparate parts of the application into a cohesive whole. The "Magazine" layout and "LoCommit" system were particularly challenging but rewarding implementations that give the platform its unique identity—distinguishing it from generic project management tools.

My process involved "depth-first" development: instead of broad, shallow features, I ensured that key flows (like the video upload-to-reel pipeline) were polished and production-ready. This approach allows me to now submit a working prototype that feels "real" and ready for user testing, rather than a wireframe. It addresses the core risk of "scope creep" by proving that the most complex interactive elements are now stable.

## Feedback implemented
Building on the feedback to focus on distinctiveness and functionality:
- **Visual Identity:** The "Magazine" layout directly addresses the need for a premium, creator-focused aesthetic that "wows" the user, moving away from standard lists.
- **Concrete Mechanics:** The detailed implementation of the "LoCommit" system provides a concrete answer to "how will you encourage habits?", replacing abstract theory with working code (heatmaps and logic).
- **Production Readiness:** By finalizing the upload and profile systems, I have ensured that the "Full Draft" is not just a skeleton, but a body that can actually handle user content.

## AI Statement
*A statement on AI use is required for all assignments.*

There are two main ways I interact with AI in the current iteration of my project to improve my productivity:
1.  **Cursor for Development:** I extensively utilized Cursor to accelerate code writing, specifically for:
    - **Complex Logic:** Generating the date-math logic for the "LoCommit" Contribution Graph.
    - **Boilerplate & UI:**  Rapidly scaffolding the "Magazine" layout components and "Upload" modals.
    - **Debugging:** Fixing hydration issues and type errors in the Next.js/Supabase integration.
2.  **Documentation & Ideation:**
    - Consulted generative tools to help structure project documentation and cover sheets, ensuring clarity and professional tone.
    - Used AI features in design tools to assist with high-fidelity animation concepts before implementing them in code.
3.  **Grammarly:** Used to ensure professional quality in all written deliverables.
