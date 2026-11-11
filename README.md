# MindBloom

A student-wellness prototype that combines daily check-ins, short skill-building activities, and explainable patterns to help trusted adults notice when a student may need support.

**2026 UA Little Rock AI Hackathon & HealthTech Startup Week: 4th place, $2,000 team prize.** The organizer's June 16, 2026 results email lists eight team members and a $250 award per member. These are competition awards, not app revenue.

[Live demo](https://mindbloom-ai-app.lovable.app/) · [Student dashboard](https://mindbloom-ai-app.lovable.app/student-dashboard) · [Team presentation](https://docs.google.com/presentation/d/1iDPEgJtQppI4zQXNg8ko-38plpY3MKdfvMvlYerw0jU/edit)

## What the prototype does

- Student check-ins for mood, stress, energy, and sleep, plus journal reflections.
- Guided breathing, grounding, mindfulness, and other short wellness activities.
- A garden, streaks, and progress feedback to encourage consistent participation.
- A counselor dashboard with student trends, support alerts, and explanations of the signals behind recommendations.
- Demonstrations of calendar and wearable settings and contextual school information.

## How we built it

MindBloom was developed as a team project during the June 8–12, 2026 hackathon at UA Little Rock. The team was Anay Pandit, Hannah Robertson, Jake Hu, Joel Johnson, Luke Wang, Rudra Pratap Mukherjee, Tanisha Virani, and Vishak Meenachi.

An earlier prototype used Vercel v0 and Next.js; that version remains in this repository's earlier commits. The current app was built and iterated in **Lovable** using **React 19, TypeScript, TanStack Start/Router, Vite, and Tailwind CSS 4**. Radix/shadcn components provide UI primitives, Recharts draws trends, Lottie animates the garden, and Lucide supplies icons. Supabase client and server integration scaffolding is included.

Development involved describing the product and screens to Lovable, reviewing the generated interface, and iterating on behavior. The recorded project history includes refinements to the counted-exhale breathing animation, cycle progress, and example student names. Lovable generated and edited implementation code with those instructions. This is a team-built, AI-assisted prototype; the repository does not claim that Anay independently wrote every component.

The wellness analysis in `src/lib/mindbloom-ai.ts` uses explicit rules and changes relative to a student's baseline. It produces understandable signal summaries from sample data. It is not a trained diagnostic model or a live LLM service.

## Run locally

Use Bun with the committed lockfile:

```sh
bun install --frozen-lockfile
cp .env.example .env
# Fill in your own Supabase project URL and publishable key.
bun run dev
```

Open the local address printed by Vite. To build:

```sh
bun run build
```

The export includes Supabase initialization, so use your own project's configuration. Never put a Supabase service-role key in a `VITE_` variable. `.env` files are excluded from Git.

## Source map

| Location | Purpose |
|---|---|
| `src/routes/index.tsx` | Product landing page |
| `src/routes/student-dashboard.tsx` | Check-ins, journal, skills, garden, and settings |
| `src/routes/counselor-dashboard.tsx` | Student trends and supportive outreach workflows |
| `src/routes/signin.tsx` | Demonstration role-selection/sign-in screen |
| `src/lib/mindbloom-ai.ts` | Explainable pattern rules and sample signals |
| `src/lib/build-skills/` | Activity definitions and local progress/preferences |
| `src/lib/support-alerts.ts` | Local demonstration alert store |
| `src/integrations/supabase/` | Supabase integration scaffolding |
| `public/__l5e/assets-v1/` | Images copied from the published app for portability |

## Prototype boundaries

The dashboards use mock student data and browser-local state. Calendar and wearable connections are demonstrations. The sign-in screen navigates to the chosen role; it does not authenticate those form credentials. Labels about encryption and privacy in the interface are product mockups, not proof of implemented end-to-end encryption or production access controls. Use sample data when exploring this version.

MindBloom does not diagnose mental-health conditions. Recommendations illustrate supportive workflows for human review; the prototype has not established clinical effectiveness.

## Version and recognition

The current source was exported from [the Lovable project](https://lovable.dev/projects/44378545-4b55-4241-a139-05cc15806aef) on November 10, 2026, at the displayed revision `6f718860`. This replaces the older v0 implementation on the default branch while preserving its Git history. Documentation, an environment template, and copies of the images used by the app were added for the GitHub handoff. This is a snapshot; automatic Lovable-to-GitHub sync has not been connected.

[UA Little Rock's project coverage](https://ualr.edu/news/2026/06/16/arkansas-students-reimagine-healthcare-at-ua-little-rock-ai-hackathon/) identifies Mind Bloom and its team. The fourth-place award and amount are documented in the organizer's June 16 results email, “Important Wrap Ups - AI Hackathon Survey, Photos, Scores, Prizes & Free Learning Opps.”
