type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface SectionHeadingProps {
  children: React.ReactNode;
  as?: HeadingTag;
}

export function SectionHeading({
  children,
  as: Tag = "h2"
}: SectionHeadingProps) {
  return (
    <Tag className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
      {children}
    </Tag>
  );
}
