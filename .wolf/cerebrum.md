# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-05-12

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

## Key Learnings

- **Project:** giu-nexus
- **Description:** AI-Powered Career & Talent Platform
- **HF NER models are wrong for skill extraction**: `dslim/bert-base-NER` tags CoNLL-2003 entities (Person/Org/Loc/Misc). It detects "GIU" as ORG and misses "Node.js"/"MERN stack". Use keyword matching against a TECH_SKILLS list instead.
- **HF chatCompletion provider routing**: Without `provider: 'hf-inference'`, HF SDK v4+ auto-routes to external providers (like featherless-ai) which may fail with HTTP errors. Always pass `provider: 'hf-inference'` when using free models.
- **Application status vs User status are independent**: Application statuses are `pending/shortlisted/rejected`. User (recruiter) account statuses are `pending/approved/rejected`. Recruiter accepting an applicant = setting application to `shortlisted`, NOT setting user to `approved`.

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->
