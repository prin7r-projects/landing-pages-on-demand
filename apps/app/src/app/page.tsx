import Link from "next/link";
import { templates } from "@/data/templates";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper text-ink px-5 sm:px-8 py-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-5xl uppercase tracking-tighter2 mb-4">
          DropHouse
        </h1>
        <p className="text-mute text-lg mb-12">Vertical Playbook templates</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/templates/${template.id}`}
              className="block border border-ink/10 bg-white p-6 hover:border-ink/30 transition-colors"
            >
              <h2 className="font-display uppercase text-lg tracking-tighter2 mb-2">
                {template.name}
              </h2>
              <p className="text-sm text-mute leading-relaxed">
                {template.description}
              </p>
              <div className="mt-3 font-mono text-[11px] uppercase tracking-wider text-mute/70">
                {template.steps.length} steps · {template.roles.length} roles
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
