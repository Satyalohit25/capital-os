interface Props {
  name: string;
  phase: string;
  description?: string;
}

export function LockedModule({ name, phase, description }: Props) {
  return (
    <div className="mx-auto max-w-4xl px-12 py-16">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
        {phase} — Coming soon
      </div>
      <h1 className="mb-3 font-serif text-4xl text-neutral-900">{name}</h1>
      <p className="mb-12 max-w-[56ch] text-pretty text-neutral-500">
        {description ??
          "This module is reserved in the roadmap and will unlock in a later phase. Your data model already accommodates it — nothing here will need to be rebuilt."}
      </p>

      <div className="space-y-6 rounded-2xl bg-neutral-100 p-8 ring-1 ring-black/5">
        {[80, 65, 90, 55, 70, 45].map((w, i) => (
          <div key={i} className="space-y-3">
            <div className="h-2 w-24 rounded bg-neutral-300" />
            <div
              className="h-3 rounded bg-neutral-200"
              style={{ width: `${w}%`, animation: `pulse 2s ${i * 0.15}s infinite` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
