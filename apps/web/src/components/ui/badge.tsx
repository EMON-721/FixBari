import { cn } from "@local-services/ui";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "muted";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-current bg-transparent",
    muted: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
