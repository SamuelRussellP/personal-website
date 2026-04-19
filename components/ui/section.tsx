import { cn } from "@/lib/utils";
import { Container } from "./container";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title?: string;
  lede?: string;
  tightTop?: boolean;
}

export function Section({
  id,
  eyebrow,
  title,
  lede,
  className,
  children,
  tightTop,
  ...props
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "w-full",
        tightTop ? "pt-8 md:pt-12" : "pt-20 md:pt-32",
        "pb-20 md:pb-32",
        className
      )}
      {...props}
    >
      <Container>
        {(eyebrow || title || lede) && (
          <header className="mb-12 md:mb-20 max-w-3xl">
            {eyebrow && (
              <p className="font-mono-meta text-xs uppercase tracking-[0.18em] text-[var(--accent)] mb-4">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-display text-4xl md:text-6xl text-foreground leading-[1.05]">
                {title}
              </h2>
            )}
            {lede && (
              <p className="mt-6 text-lg md:text-xl text-[var(--muted)] leading-relaxed">
                {lede}
              </p>
            )}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
