import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GraduationCap, HeartHandshake, Lock, Mail } from "lucide-react";
import { Nav } from "@/components/mindbloom/Nav";
import { Footer } from "@/components/mindbloom/Footer";
import treesBg from "@/assets/trees.png.asset.json";
import logoMark from "@/assets/mindbloom-mark.png.asset.json";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in to MindBloom" },
      { name: "description", content: "Sign in to your MindBloom dashboard — student or counselor." },
      { property: "og:title", content: "Sign in to MindBloom" },
      { property: "og:description", content: "Sign in to your MindBloom dashboard — student or counselor." },
    ],
  }),
  component: SignInPage,
});

type RoleId = "student" | "counselor";

type Role = {
  id: RoleId;
  to: "/student-dashboard" | "/counselor-dashboard";
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent: string; // CSS var
};

const ROLES: Role[] = [
  {
    id: "student",
    to: "/student-dashboard",
    title: "Student",
    description: "Daily check-ins, skills, streaks, and progress.",
    Icon: GraduationCap,
    accent: "var(--bloom)",
  },
  {
    id: "counselor",
    to: "/counselor-dashboard",
    title: "Counselor",
    description: "Alerts, student trends, and support prioritization.",
    Icon: HeartHandshake,
    accent: "var(--sky)",
  },
];

function SignInPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<RoleId>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const role = ROLES.find((r) => r.id === selected)!;

  function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => navigate({ to: role.to }), 350);
  }

  function continueWith(_provider: string) {
    setSubmitting(true);
    setTimeout(() => navigate({ to: role.to }), 350);
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="hero_bgx"
        style={{
          backgroundImage: `url(${treesBg.url})`,
          backgroundPosition: "center top",
          top: 0,
          height: "100%",
          zIndex: -1,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(236,243,237,0.45) 0%, rgba(236,243,237,0.55) 18%, rgba(236,243,237,0.70) 32%, rgba(236,243,237,0.85) 45%, #ecf3ed 58%, #ecf3ed 100%)",
          }}
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 45% at 18% 12%, color-mix(in oklab, var(--bloom) 16%, transparent), transparent 70%), radial-gradient(45% 38% at 88% 18%, color-mix(in oklab, var(--sky) 16%, transparent), transparent 70%), radial-gradient(55% 45% at 50% 100%, color-mix(in oklab, var(--leaf) 12%, transparent), transparent 70%)",
        }}
      />
      <Nav />

      <main className="mx-auto flex w-full max-w-xl flex-col items-center px-4 pb-20 pt-10 sm:pt-16">
        <div className="w-full rounded-3xl border border-white/50 bg-white/55 p-6 shadow-[0_20px_60px_-24px_rgba(40,80,70,0.28)] backdrop-blur-xl sm:p-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3">
              <img src={logoMark.url} alt="MindBloom" width={56} height={56} className="rounded-md" />
              <span className="text-2xl font-semibold tracking-tight sm:text-3xl">MindBloom</span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Sign in to your Dashboard
            </h1>
          </div>

          {/* Role selector */}
          <div className="mt-6">
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => {
                const isActive = r.id === selected;
                const Icon = r.Icon;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelected(r.id)}
                    aria-pressed={isActive}
                    className={`group relative flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all duration-200 active:scale-[0.98] ${
                      isActive
                        ? "border-transparent bg-white shadow-[0_8px_24px_-12px_rgba(40,80,70,0.35)] ring-2"
                        : "border-white/60 bg-white/40 hover:bg-white/60"
                    }`}
                    style={isActive ? { boxShadow: `0 8px 24px -12px ${r.accent}` } : undefined}
                  >
                    <span
                      className="grid h-9 w-9 place-items-center rounded-xl transition-colors"
                      style={{
                        background: isActive
                          ? `color-mix(in oklab, ${r.accent} 18%, white)`
                          : "rgba(255,255,255,0.7)",
                        color: isActive ? r.accent : "currentColor",
                      }}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span className={`text-xs font-semibold ${isActive ? "text-foreground" : "text-foreground/75"}`}>
                      {r.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="mt-5 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-foreground/80">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.edu"
                  className="w-full rounded-xl border border-white/60 bg-white/70 py-2.5 pl-9 pr-3 text-sm shadow-inner outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-sky/40"
                />
              </div>
            </label>

            <label className="block">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-foreground/80">Password</span>
                <button type="button" className="text-xs font-medium text-sky hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/60 bg-white/70 py-2.5 pl-9 pr-3 text-sm shadow-inner outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-sky/40"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-[1.05] active:scale-[0.99] disabled:opacity-70"
              style={{
                background: `linear-gradient(90deg, ${role.accent}, color-mix(in oklab, ${role.accent} 55%, var(--sky)))`,
                boxShadow: `0 8px 20px -8px color-mix(in oklab, ${role.accent} 60%, transparent)`,
              }}
            >
              {submitting ? "Signing in…" : `Sign in as ${role.title}`}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-foreground/10" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">or continue with</span>
            <div className="h-px flex-1 bg-foreground/10" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-3 gap-2">
            <SocialButton label="Google" onClick={() => continueWith("google")}>
              <GoogleIcon />
            </SocialButton>
            <SocialButton label="Apple" onClick={() => continueWith("apple")}>
              <AppleIcon />
            </SocialButton>
            <SocialButton label="Microsoft" onClick={() => continueWith("microsoft")}>
              <MicrosoftIcon />
            </SocialButton>
          </div>

        </div>

      </main>
      <Footer />
    </div>
  );
}

function SocialButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Continue with ${label}`}
      className="flex items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-xs font-semibold text-foreground/80 transition-all hover:bg-white active:scale-[0.98]"
    >
      <span className="grid h-4 w-4 place-items-center">{children}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2C29.1 35.5 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.2 5.2C40.9 36.8 44 31 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.42 2.22-1.18 3.04-.82.89-2.17 1.58-3.28 1.49-.14-1.1.39-2.25 1.13-3.04C13.85 1.93 15.2 1.29 16.365 1.43zM20.5 17.34c-.55 1.27-.81 1.84-1.52 2.96-1 1.56-2.4 3.5-4.13 3.52-1.54.02-1.94-1.01-4.03-1-2.09.01-2.53 1.02-4.07.99-1.74-.03-3.07-1.78-4.07-3.34C.16 16.66-.13 11.71 1.78 9.05c1.36-1.89 3.51-3 5.53-3 2.06 0 3.36 1.13 5.06 1.13 1.65 0 2.66-1.14 5.04-1.14 1.8 0 3.7.98 5.06 2.68-4.45 2.44-3.73 8.81-2.97 8.62z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}
