import type { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageShell({ eyebrow, title, description, actions, children }: Props) {
  return (
    <div className="mx-auto max-w-6xl px-8 py-10 lg:px-12 lg:py-12">
      <header className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          {eyebrow && (
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
              {eyebrow}
            </div>
          )}
          <h1 className="mb-2 text-balance font-serif text-3xl text-foreground">{title}</h1>
          {description && (
            <p className="max-w-[56ch] text-pretty text-muted-foreground">{description}</p>
          )}
        </div>
        {actions}
      </header>
      {children}
    </div>
  );
}
