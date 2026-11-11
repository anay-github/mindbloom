import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

const NAV = [
  { label: "Why", href: "#why" },
  { label: "How", href: "#how" },
  { label: "Detection", href: "#detection" },
  { label: "Skills", href: "#skills" },
  { label: "Counselors", href: "#counselors" },
  { label: "Context", href: "#context" },
];





export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashboardLabel =
    pathname === "/student-dashboard"
      ? "Student Dashboard"
      : pathname === "/counselor-dashboard"
        ? "Counselor Dashboard"
        : null;

  return (
    <header className={`sticky top-0 z-50 transition-all ${scrolled ? "py-2" : "py-3"}`}>
      <div className="mx-auto max-w-7xl px-4">
        <nav
          className={`relative flex items-center justify-between rounded-full border border-white/60 bg-white/80 px-3 py-2 pl-4 shadow-[0_8px_30px_-12px_rgba(60,50,120,0.25)] ring-1 ring-black/[0.03] backdrop-blur-xl backdrop-saturate-150 transition-all ${
            scrolled ? "bg-white/90 shadow-[0_14px_40px_-12px_rgba(60,50,120,0.35)]" : ""
          }`}
        >
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>

          {dashboardLabel ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm font-semibold text-foreground/80 sm:inline">
                {dashboardLabel}
              </span>
              {pathname === "/counselor-dashboard" && (
                <button
                  onClick={() => setAuditOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/70 px-3 py-1.5 text-xs font-semibold text-foreground/70 hover:bg-white hover:text-foreground"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Audit Log
                </button>
              )}
              <Link
                to="/"
                className="rounded-full border border-border bg-white/70 px-3 py-1.5 text-xs font-semibold text-foreground/75 hover:bg-white"
              >
                ← Home
              </Link>
            </div>
          ) : (
            <>
              <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
                {NAV.map((item) => (
                  <a
                    key={item.label}
                    href={pathname === "/" ? item.href : `/${item.href}`}
                    className="pointer-events-auto rounded-full px-3 py-1.5 text-sm font-medium text-foreground/75 transition-colors hover:bg-white/70"
                  >
                    {item.label}
                  </a>
                ))}

              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/signin"
                  className="inline-flex items-center rounded-full bg-sky px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-sky/25 transition-transform hover:scale-[1.02]"
                >
                  Sign In
                </Link>
              </div>
            </>
          )}
        </nav>
      </div>

      <Dialog open={auditOpen} onOpenChange={setAuditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-leaf" />
              Data Governance & System Audit Log
            </DialogTitle>
          </DialogHeader>
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface-2/50 text-sm">
            {[
              {
                tag: "System",
                time: "11:42 AM",
                text: "Edge-Processing Node: Data Encryption Key Rotation Successful",
                tone: "bg-leaf/15 text-leaf-foreground",
              },
              {
                tag: "Auth",
                time: "09:15 AM",
                text: "Zero-Trust API: MFA Verified for Counselor ID 8042",
                tone: "bg-sky/15 text-sky-foreground",
              },
              {
                tag: "Privacy",
                time: "08:30 AM",
                text: "Semantic Engine: PII scrubbed and raw text vector discarded",
                tone: "bg-bloom/15 text-bloom-foreground",
              },
            ].map((e) => (
              <li key={e.tag} className="flex items-start gap-3 p-3">
                <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${e.tone}`}>
                  [{e.tag}]
                </span>
                <span className="font-mono text-xs text-muted-foreground">{e.time}</span>
                <span className="text-foreground/80">{e.text}</span>
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAuditOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}

