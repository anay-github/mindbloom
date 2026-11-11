import { useEffect, useRef, useState, type ReactNode, type ElementType, type CSSProperties } from "react";

type Variant = "up" | "left" | "right" | "scale";

interface RevealProps {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
  as?: ElementType;
  style?: CSSProperties;
  /** trigger only once (default true) */
  once?: boolean;
  /** rootMargin offset */
  threshold?: number;
}

export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className = "",
  as: Tag = "div",
  style,
  once = true,
  threshold = 0.15,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, threshold]);

  return (
    <Tag
      ref={ref as never}
      data-variant={variant}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/** Wrap children and apply a staggered delay to each direct child. */
export function RevealStagger({
  children,
  step = 90,
  variant = "up",
  className = "",
  start = 0,
}: {
  children: ReactNode[];
  step?: number;
  variant?: Variant;
  className?: string;
  start?: number;
}) {
  return (
    <>
      {children.map((child, i) => (
        <Reveal key={i} variant={variant} delay={start + i * step} className={className}>
          {child}
        </Reveal>
      ))}
    </>
  );
}
