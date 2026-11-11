import { ArrowLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

type BackButtonProps = {
  /** Optional override. If omitted, falls back to router/browser history back. */
  onClick?: () => void;
  label?: string;
  className?: string;
};

export function BackButton({ onClick, label = "Back", className = "" }: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (onClick) {
      onClick();
      return;
    }
    // Prefer router history (preserves SPA state); fall back to window history.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className={`group inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/30 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md transition-all duration-200 hover:bg-white/55 hover:text-foreground active:scale-95 ${className}`}
    >
      <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
      <span>{label}</span>
    </button>
  );
}
