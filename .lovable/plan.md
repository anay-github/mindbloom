# Build Skills Rebuild

A large, multi-part rebuild of the Skills tab. Below is the implementation plan so we can confirm before I touch ~2800 lines + new files.

## Scope summary

1. Rename "Skills" → "Build Skills" everywhere in the student dashboard (nav tab, headings, copy, callouts on Today/Resources).
2. New 90-activity library (Breathing, Mindfulness, Grounding, Journaling, Stress Reset, Emotional Regulation) with the exact titles, themes, difficulties, times, XP, and short descriptions from the spec.
3. First-visit Personalization popup (multi-select Theme / Difficulty / Activities + "Build My Path"); reopenable via "Edit Preferences" button.
4. Settings: convert Personalization + Preferred Activities to multi-select with the new option sets; shared state with the popup.
5. Personalized vertical Duolingo-style pathway: prioritized order (themes → categories → difficulty → easier first), no >2 same-category in a row, milestone chest every 5 activities, node states (completed / current / available / locked), MindBloom palette (no Duolingo colors/assets).
6. Right-side rail: "Your Level" (level, XP, next-level bar, title) + "Daily Quests" (3 quests with progress bars + reward chest, updated on activity completion).
7. Activity popup: title, category, theme, difficulty, time, XP, interactive UI per category, progress, "Finish and Earn X XP" (enabled only after the interactive completes), completion celebration → Continue.
8. Six category interactives: animated breathing circle; mindfulness step prompts; grounding sensory checklist; journaling textarea with mic icon; stress-reset step cards w/ timer; emotional regulation emotion + intensity + coping picker.
9. On finish: mark complete, award XP, recompute level, advance quests, unlock next node, celebration toast, change node to checkmark.

## File layout

New files (keeps `student-dashboard.tsx` from ballooning):

```
src/lib/build-skills/
  types.ts                 // Activity, Theme, Difficulty, Category, Prefs
  activities.ts            // full 90-activity library
  prioritize.ts            // pure fn: prefs → ordered path + chest insertions
  levels.ts                // LEVELS table + levelFromXp (Growing Learner etc.)
  quests.ts                // daily quest defs + progress updater

src/components/mindbloom/build-skills/
  BuildSkillsSection.tsx   // main section (path + right rail + dialogs)
  PathNode.tsx             // circular node w/ state
  PathwayColumn.tsx        // vertical zig-zag layout + chests
  RightRail.tsx            // Level card + Daily Quests card
  PersonalizationDialog.tsx
  ActivityDialog.tsx       // shell + completion screen
  interactives/
    BreathingPlayer.tsx
    MindfulnessPlayer.tsx
    GroundingPlayer.tsx
    JournalingPlayer.tsx
    StressResetPlayer.tsx
    EmotionRegPlayer.tsx
```

Edits to `src/routes/student-dashboard.tsx`:
- Rename nav tab `"Skills"` → `"Build Skills"`; rename `section === "skills"` callers to `"build-skills"` (keep route key short).
- Replace the entire current Skills section body with `<BuildSkillsSection ... />`.
- Lift `prefs`, `completedActivities`, `xp`, `questProgress` state up so Settings + Today widgets stay in sync. Persist `prefs` and `completedActivities` to `localStorage` so the popup doesn't re-prompt.
- Rewrite the Settings → Personalization + Preferred Activities blocks to multi-select pill groups bound to the same `prefs` state.
- Update Today/Resources copy that says "Open Skills" → "Open Build Skills".

## Design / branding

- Use existing tokens: `--bloom`, `--leaf`, `--sky`, `--coral`, `--primary`. No new dark/duolingo green. Light bg, soft shadows, rounded-2xl, glassmorphism on the rail — matches Core memory.
- Node colors: completed = leaf, current = bloom w/ progress ring, available = sky, locked = muted. Chest = soft amber gradient (not Duolingo yellow).
- Path: ~120px vertical spacing, alternating ±60px horizontal offset, SVG connector lines.
- No emergency/red. Celebration uses gentle confetti dots + "Skill complete!" copy.

## Technical details

- `Prefs = { themes: Theme[]; difficulties: Difficulty[]; categories: Category[] }`. Stored in `localStorage` under `mb_buildskills_prefs`; presence of key gates the first-visit popup.
- `prioritize(activities, prefs)`:
  1. score each activity: +3 if theme matches, +2 if category matches, +1 if difficulty matches, −difficultyRank, −timeMinutes/10.
  2. stable-sort by score desc.
  3. greedy reorder: never place 3 of the same category consecutively (swap with next non-matching).
  4. insert a `{ kind: "chest" }` after every 5 activities.
- `unlocked`: derived as `completed.length` (next activity index). All earlier = completed/available, later = locked.
- Level table: 0/100/250/450/700/1000/1350/1750/2200/2700 with titles ("New Sprout", "Growing Learner", "Steady Practicer", "Calm Builder", "Bloom Cultivator", "Mindful Mentor", "Wellness Guide", "Garden Keeper", "Bloom Master", "Bloom Sage").
- Daily quests: pick 3 from a pool each "day" (seeded by date). Progress updates on activity completion based on category/theme/XP.
- Interactives are self-contained and call `onComplete()` once finished, which enables the Finish button.

## Out of scope (confirm if you want them too)

- Backend persistence (everything is local state + localStorage; no Cloud writes).
- Counselor/Teacher/Family views — not touched.
- Translating the existing badge/streak system; the new XP/level replaces only the Build Skills XP rail, not the homepage Bloom Streak.

## What it will look like at the end

- Click "Build Skills" tab → first time: blurred overlay + personalization dialog → submit → vertical pathway populated, level + quests on the right.
- Click a node → activity dialog with the right interactive → finish → +XP, +quest progress, next node unlocks, chest appears at milestones.
- Settings → Personalization & Preferred Activities are multi-select and stay in sync with the popup; "Edit Preferences" at the top of Build Skills reopens the dialog.

Reply "go" (or with any tweaks) and I'll build it.
