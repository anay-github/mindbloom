import { useMemo, useState } from "react";
import { Sparkles, Plus, Search, FileText, Youtube, Link as LinkIcon, StickyNote, Check, X, Calendar } from "lucide-react";
import { Chip } from "./ui-bits";

type ResourceType = "exercise" | "video" | "article" | "pdf" | "link" | "note";
type Library = "AR ConnectNow" | "Custom";

export type Resource = {
  id: string;
  title: string;
  description: string;
  library: Library;
  category: string;
  type: ResourceType;
  url?: string;
};

const SEED_RESOURCES: Resource[] = [
  // AR ConnectNow
  { id: "arc-mind-1", title: "Mindful Minute", description: "A short guided mindfulness practice for the classroom.", library: "AR ConnectNow", category: "Mindfulness", type: "exercise", url: "https://uamshealth.com/ar-connectnow/build-skills/" },
  { id: "arc-box-1", title: "Box Breathing", description: "4-4-4-4 breathing to settle the nervous system.", library: "AR ConnectNow", category: "Box Breathing", type: "exercise", url: "https://uamshealth.com/ar-connectnow/build-skills/" },
  { id: "arc-bal-1", title: "Balloon Breathing", description: "Slow belly breaths visualized as a balloon inflating.", library: "AR ConnectNow", category: "Balloon Breathing", type: "exercise" },
  { id: "arc-body-1", title: "Body Scan", description: "Notice tension from head to toe with a gentle scan.", library: "AR ConnectNow", category: "Body Scan", type: "exercise" },
  { id: "arc-sense-1", title: "5-4-3-2-1 Sensory Countdown", description: "Ground yourself using your five senses.", library: "AR ConnectNow", category: "Sensory Countdown", type: "exercise" },
  { id: "arc-relax-1", title: "Progressive Muscle Relaxation", description: "Tense and release each muscle group to relax.", library: "AR ConnectNow", category: "Relaxation Exercises", type: "exercise" },
  { id: "arc-stress-1", title: "Reframing Stress", description: "A short reflection on shifting your view of stress.", library: "AR ConnectNow", category: "Stress Management", type: "article" },
  { id: "arc-stress-2", title: "Calm Down Toolkit (video)", description: "Quick video with three calm-down strategies.", library: "AR ConnectNow", category: "Stress Management", type: "video", url: "https://www.youtube.com/results?search_query=calm+down+toolkit" },

];

const CATEGORIES_BY_LIB: Record<Library, string[]> = {
  "AR ConnectNow": ["Mindfulness", "Box Breathing", "Balloon Breathing", "Body Scan", "Sensory Countdown", "Relaxation Exercises", "Stress Management"],
  "Custom": [],
};

export type Assignment = {
  id: string;
  resourceId: string;
  title: string;
  due: string; // yyyy-mm-dd
  note: string;
  status: "Not started" | "In progress" | "Completed";
};

type Props = {
  studentName: string;
  studentStatus: "Support" | "Watch" | "On Track";
};

const TYPE_ICON: Record<ResourceType, typeof FileText> = {
  exercise: Sparkles,
  video: Youtube,
  article: FileText,
  pdf: FileText,
  link: LinkIcon,
  note: StickyNote,
};

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function AssignResources({ studentName, studentStatus }: Props) {
  const first = studentName.split(" ")[0];
  const [library, setLibrary] = useState<Library | "All">("All");
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [resources, setResources] = useState<Resource[]>(SEED_RESOURCES);
  const [assignmentsByStudent, setAssignmentsByStudent] = useState<Record<string, Assignment[]>>({});
  const [addingCustom, setAddingCustom] = useState(false);
  const [pending, setPending] = useState<Resource | null>(null);

  const assignments = assignmentsByStudent[studentName] ?? [];

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (library !== "All" && r.library !== library) return false;
      if (category !== "All" && r.category !== category) return false;
      if (query && !(r.title + r.description + r.category).toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [resources, library, category, query]);

  const aiSuggested = useMemo(() => {
    const ids =
      studentStatus === "Support"
        ? ["arc-box-1", "arc-body-1", "arc-stress-2"]
        : studentStatus === "Watch"
          ? ["arc-mind-1", "arc-sense-1", "tris-2"]
          : ["arc-mind-1", "tris-3"];
    return ids.map((id) => resources.find((r) => r.id === id)).filter(Boolean) as Resource[];
  }, [studentStatus, resources]);

  function openAssign(r: Resource) {
    setPending(r);
  }

  function confirmAssign(due: string, note: string) {
    if (!pending) return;
    setAssignmentsByStudent((prev) => {
      const list = prev[studentName] ?? [];
      const next: Assignment = {
        id: `${pending.id}-${Date.now()}`,
        resourceId: pending.id,
        title: pending.title,
        due,
        note,
        status: "Not started",
      };
      return { ...prev, [studentName]: [next, ...list] };
    });
    setPending(null);
  }

  function cycleStatus(id: string) {
    setAssignmentsByStudent((prev) => {
      const list = prev[studentName] ?? [];
      const order: Assignment["status"][] = ["Not started", "In progress", "Completed"];
      return {
        ...prev,
        [studentName]: list.map((a) =>
          a.id === id ? { ...a, status: order[(order.indexOf(a.status) + 1) % order.length] } : a,
        ),
      };
    });
  }

  function removeAssignment(id: string) {
    setAssignmentsByStudent((prev) => ({
      ...prev,
      [studentName]: (prev[studentName] ?? []).filter((a) => a.id !== id),
    }));
  }

  function addCustom(r: Omit<Resource, "id" | "library" | "category"> & { category?: string }) {
    const id = `cust-${Date.now()}`;
    const created: Resource = {
      id,
      library: "Custom",
      category: r.category || "General",
      title: r.title,
      description: r.description,
      type: r.type,
      url: r.url,
    };
    setResources((rs) => [created, ...rs]);
    setAddingCustom(false);
    setLibrary("Custom");
    setCategory("All");
  }

  const categories = library === "All"
    ? Array.from(new Set(resources.map((r) => r.category)))
    : library === "Custom"
      ? Array.from(new Set(resources.filter((r) => r.library === "Custom").map((r) => r.category)))
      : CATEGORIES_BY_LIB[library];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-white/80 p-4 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Left: Browse & Assign library + assignments */}
          <div>
            <div className="mb-2 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">Browse &amp; Assign Build Skills Library</h3>
                <p className="text-xs text-muted-foreground">Search trusted skills and track what&apos;s assigned to {first}.</p>
              </div>
              <span className="text-[11px] text-muted-foreground">{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-1 min-w-[160px] items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search resources…"
                  className="w-full bg-transparent text-xs outline-none"
                />
              </div>
              <select
                value={library}
                onChange={(e) => { setLibrary(e.target.value as Library | "All"); setCategory("All"); }}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-xs"
              >
                <option value="All">All libraries</option>
                <option value="AR ConnectNow">AR ConnectNow</option>
                <option value="Custom">Custom</option>
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-xs"
              >
                <option value="All">All categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button
                onClick={() => setAddingCustom(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold hover:border-bloom hover:bg-bloom/5"
              >
                <Plus className="h-3.5 w-3.5" /> Custom
              </button>
            </div>

            <div className="mt-3 grid gap-2">
              {filtered.slice(0, 4).map((r) => {
                const Icon = TYPE_ICON[r.type];
                return (
                  <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Icon className="h-4 w-4 flex-none text-bloom" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{r.title}</div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <Chip tone="sky">{r.category}</Chip>
                          {r.url && (
                            <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-bloom hover:underline">
                              Open ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => openAssign(r)}
                      className="shrink-0 rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-background"
                    >
                      Assign
                    </button>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-white/50 p-4 text-center text-xs text-muted-foreground">
                  No resources match those filters.
                </div>
              )}
            </div>

            <div className="mt-4 flex items-end justify-between gap-3 border-t border-border pt-3">
              <h4 className="text-sm font-semibold">Assigned to {first}</h4>
              <span className="text-[11px] text-muted-foreground">{assignments.length}</span>
            </div>
            {assignments.length === 0 ? (
              <div className="mt-2 rounded-xl border border-dashed border-border bg-white/50 p-3 text-center text-xs text-muted-foreground">
                No resources assigned yet.
              </div>
            ) : (
              <ul className="mt-2 space-y-2">
                {assignments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white px-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{a.title}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> Due {a.due}</span>
                        {a.note && <span>· {a.note}</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => cycleStatus(a.id)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          a.status === "Completed"
                            ? "bg-leaf/20 text-leaf-foreground"
                            : a.status === "In progress"
                              ? "bg-sky/20 text-sky-foreground"
                              : "bg-surface-2 text-muted-foreground"
                        }`}
                        title="Click to update status"
                      >
                        {a.status === "Completed" && <Check className="mr-1 inline h-3 w-3" />}
                        {a.status}
                      </button>
                      <button
                        onClick={() => removeAssignment(a.id)}
                        className="rounded-full p-1 text-muted-foreground hover:bg-surface-2"
                        aria-label="Remove"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right: AI suggested skills */}
          <div className="lg:border-l lg:border-border lg:pl-5">
            <div className="mb-2 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">MindBloom AI Suggested Build Skills</h3>
                <p className="text-xs text-muted-foreground">Supportive resources based on {first}&apos;s recent patterns.</p>
              </div>
              <Chip tone="bloom">AI</Chip>
            </div>
            <div className="grid gap-2">
              {aiSuggested.slice(0, 3).map((r) => {
                const Icon = TYPE_ICON[r.type];
                return (
                  <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white px-3 py-2">
                    <div className="flex min-w-0 items-start gap-2">
                      <Icon className="mt-0.5 h-4 w-4 flex-none text-bloom" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{r.title}</div>
                        <div className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{r.description}</div>
                        <div className="mt-1"><Chip tone="sky">{r.category}</Chip></div>
                      </div>
                    </div>
                    <button
                      onClick={() => openAssign(r)}
                      className="shrink-0 rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-background"
                    >
                      Assign
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>




      {pending && (
        <AssignModal
          resource={pending}
          studentName={studentName}
          onClose={() => setPending(null)}
          onConfirm={confirmAssign}
        />
      )}
      {addingCustom && (
        <CustomResourceModal onClose={() => setAddingCustom(false)} onCreate={addCustom} />
      )}
    </div>
  );
}


function AssignModal({
  resource,
  studentName,
  onClose,
  onConfirm,
}: {
  resource: Resource;
  studentName: string;
  onClose: () => void;
  onConfirm: (due: string, note: string) => void;
}) {
  const [due, setDue] = useState(todayPlus(7));
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold">Assign to {studentName.split(" ")[0]}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{resource.title}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-surface-2"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block text-xs font-semibold">Due date
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-white p-2 text-sm" />
          </label>
          <label className="block text-xs font-semibold">Note (optional)
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              placeholder="A short, supportive message…"
              className="mt-1 w-full rounded-lg border border-border bg-white p-2 text-sm" />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-border px-3 py-1.5 text-xs">Cancel</button>
          <button onClick={() => onConfirm(due, note)} className="rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background">Assign</button>
        </div>
      </div>
    </div>
  );
}

function CustomResourceModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (r: { title: string; description: string; type: ResourceType; url?: string; category?: string }) => void;
}) {
  const [type, setType] = useState<ResourceType>("link");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({ title: title.trim(), description: description.trim(), type, url: url.trim() || undefined, category: category.trim() || undefined });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h3 className="text-base font-semibold">New custom resource</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-surface-2"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block text-xs font-semibold">Type
            <select value={type} onChange={(e) => setType(e.target.value as ResourceType)}
              className="mt-1 w-full rounded-lg border border-border bg-white p-2 text-sm">
              <option value="link">Website link</option>
              <option value="video">YouTube link</option>
              <option value="pdf">PDF</option>
              <option value="note">Note / task</option>
            </select>
          </label>
          <label className="block text-xs font-semibold">Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required
              className="mt-1 w-full rounded-lg border border-border bg-white p-2 text-sm" />
          </label>
          <label className="block text-xs font-semibold">Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="mt-1 w-full rounded-lg border border-border bg-white p-2 text-sm" />
          </label>
          {type !== "note" && (
            <label className="block text-xs font-semibold">{type === "pdf" ? "PDF URL" : type === "video" ? "YouTube URL" : "URL"}
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…"
                className="mt-1 w-full rounded-lg border border-border bg-white p-2 text-sm" />
            </label>
          )}
          <label className="block text-xs font-semibold">Category (optional)
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Stress Management"
              className="mt-1 w-full rounded-lg border border-border bg-white p-2 text-sm" />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-border px-3 py-1.5 text-xs">Cancel</button>
          <button type="submit" className="rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background">Create</button>
        </div>
      </form>
    </div>
  );
}
