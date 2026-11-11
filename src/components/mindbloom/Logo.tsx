import logoMark from "@/assets/mindbloom-mark.png.asset.json";

export function Logo({ size = 32, withText = true, className = "" }: { size?: number; withText?: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logoMark.url} alt="MindBloom" width={size} height={size} className="rounded-md" />
      {withText && (
        <span className="text-lg font-semibold tracking-tight">MindBloom</span>
      )}
    </div>
  );
}
