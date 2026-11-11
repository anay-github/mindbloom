import {
  usePrefs,
  THEMES,
  DIFFICULTIES,
  CATEGORIES as BS_CATEGORIES,
  CATEGORY_ICON,
  DEFAULT_PREFS,
  type Theme,
  type Difficulty,
  type Category,
} from "@/lib/build-skills/data";

export function BuildSkillsPrefsEditor() {
  const { prefs, setPrefs } = usePrefs();
  const p = prefs ?? DEFAULT_PREFS;
  const toggleTheme = (t: Theme) =>
    setPrefs({ ...p, themes: p.themes.includes(t) ? p.themes.filter((x) => x !== t) : [...p.themes, t] });
  const toggleDiff = (d: Difficulty) =>
    setPrefs({ ...p, difficulties: p.difficulties.includes(d) ? p.difficulties.filter((x) => x !== d) : [...p.difficulties, d] });
  return (
    <div className="mt-3 space-y-3">
      <div>
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Theme</div>
        <div className="flex flex-wrap gap-1.5">
          {THEMES.map((t) => (
            <button
              key={t}
              onClick={() => toggleTheme(t)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                p.themes.includes(t) ? "border-bloom bg-bloom/10 text-bloom" : "border-border bg-white text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Activity Difficulty</div>
        <div className="flex flex-wrap gap-1.5">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => toggleDiff(d)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                p.difficulties.includes(d) ? "border-sky bg-sky/10 text-sky" : "border-border bg-white text-muted-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BuildSkillsCategoriesEditor() {
  const { prefs, setPrefs } = usePrefs();
  const p = prefs ?? DEFAULT_PREFS;
  const toggle = (c: Category) =>
    setPrefs({ ...p, categories: p.categories.includes(c) ? p.categories.filter((x) => x !== c) : [...p.categories, c] });
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {BS_CATEGORIES.map((c) => (
        <button
          key={c}
          onClick={() => toggle(c)}
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            p.categories.includes(c) ? "border-bloom bg-bloom/10 text-bloom" : "border-border bg-white text-muted-foreground"
          }`}
        >
          <span className="mr-1">{CATEGORY_ICON[c]}</span>{c}
        </button>
      ))}
    </div>
  );
}
