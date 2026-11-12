# Project notes

[Back to README](../README.md) · [Development guide](DEVELOPMENT.md) · [Live demo](https://mindbloom-ai-app.lovable.app/)

## The idea

MindBloom is a student wellness prototype that combines daily check-ins, short skill-building activities, and explainable patterns to help trusted adults notice when a student may need support.

The team built the project during UA Little Rock's **June 8–12, 2026 AI Hackathon & HealthTech Startup Week**. The product explores two connected experiences: an encouraging student workspace and a counselor view that makes changes over time easier to review.

## Team

**Anay Pandit · Hannah Robertson · Jake Hu · Joel Johnson · Luke Wang · Rudra Pratap Mukherjee · Tanisha Virani · Vishak Meenachi**

This was collaborative, AI-assisted development. Anay participated in the team's development and iteration. Individual ownership of every component is not established by this source snapshot.

## How it was built

An earlier prototype used Vercel v0 and Next.js. The current application was built and iterated in **Lovable** with **React 19, TypeScript, TanStack Start/Router, Vite, and Tailwind CSS 4**.

Development involved describing the product and screens to Lovable, reviewing the generated interface, and refining behavior. The recorded project history includes refinements to the counted-exhale breathing animation, cycle progress, and example student names. Lovable generated and edited implementation code from the team's instructions.

Radix/shadcn components provide UI primitives, Recharts draws trends, Lottie animates the garden, and Lucide supplies icons. Supabase client and server integration scaffolding is included in the export.

## Recognition and references

The team earned **4th place and a $2,000 team competition prize**. The existing project record cites the organizer's June 16, 2026 results email, “Important Wrap Ups - AI Hackathon Survey, Photos, Scores, Prizes & Free Learning Opps,” which lists eight team members and a $250 award per member. This was a team prize, not app revenue. The private email is not published here.

[UA Little Rock's June 16 coverage](https://ualr.edu/news/2026/06/16/arkansas-students-reimagine-healthcare-at-ua-little-rock-ai-hackathon/) features Mind Bloom's student wellness concept and identifies all eight team members.

- [Team presentation](https://docs.google.com/presentation/d/1iDPEgJtQppI4zQXNg8ko-38plpY3MKdfvMvlYerw0jU/edit)
- [Recorded Lovable project](https://lovable.dev/projects/44378545-4b55-4241-a139-05cc15806aef)
- [University reporting](https://ualr.edu/news/2026/06/16/arkansas-students-reimagine-healthcare-at-ua-little-rock-ai-hackathon/)

Team materials and the editor project may require access from their owners.

## What is implemented and what is a demonstration

| Area | Current scope |
| --- | --- |
| Check-ins and journal | Interactive prototype forms, sample reflections, and local UI state. |
| Skill practice | Activity definitions, preferences, pathways, XP, quests, and browser-local progress helpers. |
| Pattern analysis | Explicit rules and comparisons with a student's baseline, using sample data. No trained diagnostic model or live LLM service. |
| Counselor support | Sample profiles, trend charts, a priority queue, local alerts, and demonstration outreach tools. |
| Sign-in | Role-based navigation; the form credentials are not authenticated by the demo screen. |
| Calendar and wearables | Demonstration settings and contextual examples rather than verified live connections. |
| Privacy and encryption | Interface copy describes intended product behavior; production access controls and end-to-end encryption are not established by this prototype. |

MindBloom does not diagnose mental-health conditions, and clinical effectiveness has not been established. Recommendations illustrate supportive workflows for human review. Explore this version with sample data.

## Source snapshot

The existing handoff record states that the current source was exported from Lovable on **November 10, 2026**, at displayed revision **`6f718860`**. It replaced the older v0 implementation on `main` while preserving earlier commits. The [legacy README](legacy-v0-README.md) is retained for historical context; it does not describe the current setup.

The handoff added documentation, an environment template, and portable copies of the images used by the app. This is a source snapshot; automatic Lovable-to-GitHub sync has not been connected in the recorded workflow.

The November 12 repository polish adds screenshots, clearer navigation, development documentation, and verified demo observations. See the [development guide](DEVELOPMENT.md) for hosting status and the limits of that verification.
