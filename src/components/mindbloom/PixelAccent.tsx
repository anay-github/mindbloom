import summer5 from "@/assets/summer5.png.asset.json";

/**
 * Subtle pixel-art accent band. Drops a tiny bit of the summer5
 * pixel sky/mountain motif into a page without dominating it.
 *
 * Variants:
 *  - "strip"  : thin horizontal band, fades into the page background
 *  - "corner" : small pixel-art tile tucked into a corner
 */
export function PixelAccent({
  variant = "strip",
  className = "",
  imageUrl,
}: {
  variant?: "strip" | "corner";
  className?: string;
  imageUrl?: string;
}) {
  const bg = imageUrl ?? summer5.url;
  if (variant === "corner") {
    return (
      <div
        aria-hidden
        className={`pointer-events-none absolute bottom-0 right-0 h-24 w-48 opacity-40 ${className}`}
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "bottom right",
          imageRendering: "pixelated",
          maskImage:
            "radial-gradient(ellipse at bottom right, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at bottom right, black 30%, transparent 75%)",
        }}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={`pointer-events-none relative -mt-20 -mb-48 h-96 w-full overflow-hidden opacity-60 ${className}`}
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center 30%",
        imageRendering: "pixelated",
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 35%, black 75%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 35%, black 75%, transparent 100%)",
      }}
    />
  );
}
