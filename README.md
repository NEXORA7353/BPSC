<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# BPSC TRE 4.0 Mathematics Real Mock Test Portal

High-yield Computer Based Test (CBT) portal for BPSC TRE 4.0 Secondary/Senior Secondary Mathematics candidates.

## Features
- **Authentic CBT Exam Interface:** Live timer, Question palette, Option E Safe Skip, and Instant Evaluation.
- **Chapter Directory & Question Bank:** Categorized syllabus chapters with bulk import, inline editor, and question filtering.
- **Automated Dual-Persona Email System:**
  - **New Published Test Alerts:** Instant notification to Candidate (detailed) & Parent (summary).
  - **Scorecard Results:** Question breakdown, accuracy %, and mistake review links dispatched upon test completion.
  - **Scheduled Reminders:** 2–3 hours before and 15 minutes before test time (managed via GitHub Actions).
  - **Daily Inactivity Alerts:** 8:00 PM IST reminder sent only if 0 tests were attempted that day.
  - **Weekly Performance Digest:** Sunday 8:00 PM IST report analyzing strong and weak mathematical topics.
- **Atomic Notification Idempotency:** Firestore transactions prevent duplicate emails across all cron triggers.

## Run Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
