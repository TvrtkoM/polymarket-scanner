import { cn } from "@/lib/utils";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
  as?: HeadingTag;
}

export const sectionHeadingClassName =
  "text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3";

export function SectionHeading({
  children,
  className = "",
  as: Tag = "h2"
}: SectionHeadingProps) {
  return (
    <Tag className={cn(sectionHeadingClassName, className)}>{children}</Tag>
  );
}
