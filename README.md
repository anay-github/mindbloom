# MindBloom

A student wellness interface prototype exploring short daily activities, participation-based motivation, and supportive school routines.

The demo pairs a student experience with a teacher and counselor portal. Its central design idea is to reward participation while presenting adults with understandable context for a supportive check-in.

## Explore the prototype

| Route | What to review |
|---|---|
| `/` | Product overview and entry points |
| `/student` | Daily check-ins, guided activities, Bloom Points, BloomBird, team goals, progress, and weekly reflection |
| `/portal` | Class overview, classroom routines, sample counselor alerts, pattern explanations, and privacy design |

### Suggested walkthrough

1. Open **Enter Student Experience** and answer the sample daily check-in.
2. Choose an activity, complete its prompts, and review the reflection and participation feedback.
3. Explore the **Team**, **Progress**, and **Weekly** tabs.
4. Return to the landing page and open **Teacher & Counselor Portal**.
5. Review the classroom routines, then select a sample student in the counselor view to inspect the explanation and check-in action.

The activity screens include Box Breathing, Sensory Countdown, Look for Green, Body Scan, and Muscle Tension & Release.

## Current implementation

This repository contains a **front-end demonstration**. Student profiles, class metrics, team standings, alerts, and pattern explanations use sample data. Interactions update React state in the current page; they do not persist across reloads or synchronize between the student and portal views.

The portal illustrates a possible support workflow. Its alerts and “AI explanation” are predefined examples, with no connected AI service or evaluated prediction model. Marking a check-in as planned changes the demo state; it does not contact a counselor or schedule an appointment.

There is no authentication, database, school integration, or real student monitoring in this version. The privacy screens describe intended product principles; production access controls and a data-handling system are future work.

## Run locally

Install the dependencies with the repository's pnpm lockfile, then start the development server:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:3000](http://localhost:3000). The package also provides `pnpm build` and `pnpm start` for a production build and server.

## Stack and assistance

- Next.js App Router, React, and TypeScript
- Tailwind CSS and reusable UI components
- Sonner for interaction feedback

The project was bootstrapped with [v0](https://v0.app). AI-assisted scaffolding is part of the development history.

[Continue the linked v0 project](https://v0.app/chat/projects/prj_lvCyljQrQBqLMOWA15BFbUXEEj0s)

## Code map

- `app/page.tsx` — landing page
- `app/student/page.tsx` — student activities, check-ins, and progress interactions
- `app/portal/page.tsx` — teacher and counselor demonstration
- `components/ui/` — shared interface components
- `app/globals.css` — global styles
