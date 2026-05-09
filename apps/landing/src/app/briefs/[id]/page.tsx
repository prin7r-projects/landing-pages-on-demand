import { notFound } from "next/navigation";
import { JetBrains_Mono } from "next/font/google";

const mono = JetBrains_Mono({ subsets: ["latin"], weight: "400" });

export default async function BriefStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch brief status from API
  let brief = null;
  let error = null;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000';
    const res = await fetch(`${baseUrl}/api/briefs/${id}`, {
      cache: 'no-store',
    });

    if (res.status === 404) {
      notFound();
    }

    if (!res.ok) {
      throw new Error('Failed to fetch brief status');
    }

    brief = await res.json();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  if (error) {
    return (
      <main className="min-h-screen bg-paper p-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-2xl uppercase">Error</h1>
          <p className="mt-4 font-mono text-sm">{error}</p>
        </div>
      </main>
    );
  }

  if (!brief) {
    return null;
  }

  const statusSteps = [
    { key: 'queued', label: 'Queued', description: 'Brief received' },
    { key: 'brand', label: 'Brand Pass', description: 'Generating brand identity' },
    { key: 'copy', label: 'Copy Pass', description: 'Writing copy' },
    { key: 'press', label: 'Press Pass', description: 'Building page' },
    { key: 'deploy', label: 'Deploy Pass', description: 'Deploying to live URL' },
    { key: 'live', label: 'Live', description: 'Page is live!' },
    { key: 'error', label: 'Error', description: 'Something went wrong' },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === brief.status);

  return (
    <main className="min-h-screen bg-paper p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className={`font-display text-2xl uppercase ${mono.className}`}>
          Brief Status
        </h1>

        <div className="mt-8 border-2 border-ink p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm uppercase tracking-wider text-mute">Brief ID</p>
              <p className="mt-1 font-mono text-lg">{brief.id}</p>
            </div>
            <div className={`rounded border-2 px-3 py-1 font-mono text-xs uppercase tracking-wider ${
              brief.status === 'live' ? 'border-accent text-accent' :
              brief.status === 'error' ? 'border-red-500 text-red-500' :
              'border-ink text-ink'
            }`}>
              {brief.status}
            </div>
          </div>

          {brief.custom_domain && (
            <p className="mt-4 font-mono text-sm">
              Domain: <span className="text-accent">{brief.custom_domain}</span>
            </p>
          )}

          {brief.deployedSite && (
            <a
              href={brief.deployedSite.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 font-mono text-sm text-accent hover:underline"
            >
              View Live Page →
            </a>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mt-8">
          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const isActive = step.key === brief.status;
              const isCompleted = currentStepIndex > index && brief.status !== 'error';
              const isUpcoming = index > currentStepIndex && brief.status !== 'error';

              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-4 ${
                    isActive ? 'opacity-100' :
                    isCompleted ? 'opacity-60' :
                    'opacity-30'
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center border-2 ${
                    isCompleted ? 'border-accent bg-accent text-paper' :
                    isActive ? 'border-ink bg-ink text-paper' :
                    'border-ink'
                  }`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div>
                    <p className="font-mono text-sm font-semibold uppercase">{step.label}</p>
                    <p className="font-mono text-xs text-mute">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Poll for updates if not live or error */}
        {(brief.status !== 'live' && brief.status !== 'error') && (
          <meta httpEquiv="refresh" content="5" />
        )}

        <div className="mt-8 font-mono text-xs uppercase tracking-wider text-mute">
          Auto-refreshes every 5 seconds while processing...
        </div>
      </div>
    </main>
  );
}
