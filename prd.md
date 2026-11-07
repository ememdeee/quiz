# Product Requirements Document (PRD) - Course Platform v2.0

## 1. Overview
A lightweight, static-first course delivery platform built with **Next.js (App Router)**. This platform serves as a high-performance content delivery system where all course data is driven by a validated JSON structure, eliminating the need for a traditional backend or database.

Access is controlled via a **Magic Link (URL Parameter)** system, ensuring that only users with an active token can view the content without requiring a formal login/registration process.

---

## 2. Goals
- **Automated Tracking:** Seamlessly track user progress using the Wistia Player API (auto-detect video completion).
- **Zero-Backend Architecture:** Fully static + JSON-driven, ensuring ultra-fast load times and zero database maintenance.
- **Controlled Access:** Secure content using a "Magic Link" system synced with Environment Variables.
- **Data Integrity:** Use strict schema validation (Zod) to prevent runtime errors caused by manual JSON edits.
- **Local Persistence:** Save user progress in the browser’s `localStorage` with a robust re-hydration logic.

---

## 3. Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand
- **Storage:** localStorage (Client-side)
- **Data Validation:** Zod
- **Video Provider:** Wistia (Embed + Wistia Player API)
- **Deployment:** Vercel (Hosting & Environment Variables)

---

## 4. System Architecture

### High-Level Logic
1. **Source of Truth:** A static `courses.json` file contains all metadata.
2. **Access Gatekeeper:** The platform validates the `?token=` URL parameter against a server-side `COURSE_MAGIC_TOKEN`.
3. **Data Rendering:** Next.js reads and validates the JSON at build/runtime.
4. **Client State:** Zustand manages the active video and completion status, syncing every change to `localStorage`.

---

## 5. Security & Access Control (Magic Link)
The system utilizes **Option 1: URL Query Parameters** for access management.

- **URL Pattern:** `domain.com/course/[slug]?token=1981239`
- **Validation:** The application checks the `token` search parameter. If it doesn't match the `COURSE_MAGIC_TOKEN` stored in the environment variables, the user is redirected to an `/unauthorized` page.
- **Access Rotation:** To revoke access or generate a new "key," the admin simply updates the Environment Variable in the hosting dashboard and redeploys the site.

---

## 6. Data Model & Validation

### JSON Schema (Zod)
To prevent "human errors" during manual editing, the JSON must pass a Zod validation check:
- `id`: Unique identifier (used for progress tracking).
- `slug`: URL-friendly string.
- `wistiaId`: Valid Wistia hashed ID.

### Example Structure:
```json
{
  "courses": [
    {
      "id": "mbc-01",
      "slug": "mastering-basic-coding",
      "title": "Mastering Basic Coding",
      "videos": [
        {
          "id": "vid-01",
          "title": "Introduction",
          "wistiaId": "abc123xyz"
        }
      ]
    }
  ]
}
```

---

## 7. Core Features

### 7.1 Automated Progress Tracking
Instead of manual "Mark as Complete" buttons, the system integrates with the **Wistia Player API**:
- **Trigger:** `video.bind("end", callback)`
- **Action:** When a video finishes, the `videoId` is pushed to the `completedVideos` array in Zustand and saved to `localStorage`.

### 7.2 Progress Persistence
- Progress is keyed by `course_id` (e.g., `progress_mbc-01`).
- **Re-hydration:** On page load, the system reconciles `localStorage` with the current JSON. If a video was removed from the JSON, the stale ID is automatically purged from the user's local progress.

### 7.3 Progress Bar
Visual indicator calculated as: 
`(completedVideos.length / totalVideos.length) * 100`.

---

## 8. UX Flow
1. **Entry:** User clicks a link with a token (`?token=...`).
2. **Validation:** System verifies token and validates JSON data integrity.
3. **Resume:** System checks `localStorage` and automatically navigates the user to their last unwatched video.
4. **Consumption:** User watches video; Wistia API triggers "Complete" upon finishing.
5. **Persistence:** UI updates the Progress Bar and saves state instantly.

---

## 9. Admin SOP (Operational Guide)
Since there is no admin UI, follow these steps to manage the platform:
1. **Update Content:** Edit `courses.json` manually.
2. **Validate:** Run the local development server to let Zod catch any formatting or logic errors.
3. **Rotate Access:**
   - Go to Vercel/Hosting Dashboard.
   - Update `COURSE_MAGIC_TOKEN`.
   - Trigger a **Redeploy**.
4. **Distribute:** Share the new URL with the updated token parameter.

---

## 10. Risks & Mitigations
- **JSON Complexity:** If the file becomes too large, it will be split into per-course JSON files.
- **Cross-Device Sync:** Not supported by design (privacy-focused). Users are informed that progress is tied to their current browser.
- **Manual Errors:** Mitigated by strict **Zod Schema Validation** during the build process.