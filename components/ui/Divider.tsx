interface DividerProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function Divider({
  className = "",
  orientation = "horizontal",
}: DividerProps) {
  if (orientation === "vertical") {
    return <div className={`w-px h-full bg-border ${className}`} />;
  }
  return <hr className={`border-t border-border ${className}`} />;
}
