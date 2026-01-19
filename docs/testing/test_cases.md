# Trybe Product Test Cases: Project Valley Focus

This document outlines the functional and non-functional test cases for the **Project Valley** portion of Trybe. These cases are designed to verify the core utility and the LoCommit behavioral mechanics.

## 1. Authentication & Initial Onboarding
| ID | Title | Description | Expected Result |
|---|---|---|---|
| TC-AUTH-01 | Email Login/Signup | Access the app via email credentials. | User is authenticated and enters the intro flow. |
| TC-AUTH-02 | Google Login | Access the app via Google OAuth. | User is authenticated and enters the intro flow. |
| TC-ONBD-01 | Introduction Flow | Follow the initial step-by-step introduction. | User is guided through the platform's value proposition. |
| TC-ONBD-02 | First Project Creation | Create the current project the user is working on immediately after intro. | Project is initialized in the Valley. |

## 2. The LoCommit Behavioral Mechanic (The Lock)
| ID | Title | Description | Expected Result |
|---|---|---|---|
| TC-LOCK-01 | First Login Lock | Log in for the first time. | User immediately encounters the LoCommit prompt/lock. |
| TC-LOCK-02 | Initial Daily Upload | Mandatory upload of "daily progress" to unlock the dashboard. | Dashboard/Valley navigation becomes accessible only after upload. |
| TC-LOCK-03 | Navigation Access | Navigate through the app after the first unlock. | Page navigation (Valley, Dashboard) works as expected. |
| TC-LOCK-04 | Day 2 Lock | Return on the second day (after 9:00 AM TW time). | User is locked again and prompted for a new daily update. |

## 3. Project Valley Content Organization (Day 2+)
| ID | Title | Description | Expected Result |
|---|---|---|---|
| TC-VAL-01 | Channel Management | Create and rename channels within the first project. | Hierarchical structure is maintained and clickable. |
| TC-VAL-02 | Block Addition (Text) | Add a text note or brainstorming block. | Content is saved and persists. |
| TC-VAL-03 | Block Addition (Media) | Upload an image or video snippet to a channel. | Media is processed and displayed correctly. |
| TC-VAL-04 | Organizing Blocks | Try to reorganize or manage multiple blocks. | UI remains stable and intuitive. |

## 4. Technical & Edge Cases
| ID | Title | Description | Expected Result |
|---|---|---|---|
| TC-EDGE-01 | Interrupted Upload | Close the tab during a 10MB media upload. | DB reflects a partial/failed upload; no data corruption. |
| TC-EDGE-02 | Session Expiry | Leave the app open for an extended period. | User is prompted to re-login gracefully. |
| TC-EDGE-03 | Mandatory Field Check | Try to create a project or upload without a title/image. | UI shows validation errors, preventing empty submissions. |
