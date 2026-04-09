"use client";

export default function GamePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center p-6">
      <div className="rounded-xl border border-slate-600 bg-slate-800/50 p-6">
        <h1 className="text-2xl font-semibold">Game Screen</h1>
        <p className="mt-2 text-slate-300">
          API routes, Prisma schema, and generator libraries are migrated. Next step is wiring full board/hooks UI.
        </p>
      </div>
    </main>
  );
}
