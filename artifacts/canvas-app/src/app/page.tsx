import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Layers, Users, Lock, History, Zap, ArrowRight } from "lucide-react";

export default async function LandingPage() {
  const session = await getServerSession();
  if (session?.user) redirect("/dashboard");

  const features = [
    { icon: Layers, title: "Infinite Canvas", desc: "Draw, sketch, and diagram on an infinite whiteboard powered by Excalidraw." },
    { icon: Users, title: "Real-time Collaboration", desc: "Work together with your team in real-time. See cursors and changes as they happen." },
    { icon: Lock, title: "End-to-End Encryption", desc: "Your data stays private with AES-GCM encryption. Only you and your team can access it." },
    { icon: History, title: "Version History", desc: "Never lose your work. Restore any previous version of your canvas with one click." },
    { icon: Zap, title: "Workspace Management", desc: "Organize canvases into workspaces. Invite members with role-based permissions." },
    { icon: ArrowRight, title: "Invite System", desc: "Share invite links with teammates. They join your workspace instantly." },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <header className="border-b border-[hsl(var(--border))]">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--foreground))] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
              </svg>
            </div>
            <span className="font-semibold text-[hsl(var(--foreground))]">Canvas</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/sign-in" className="px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
              Sign in
            </Link>
            <Link href="/auth/sign-up" className="px-4 py-2 text-sm font-medium rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition-opacity">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--muted))] text-xs font-medium text-[hsl(var(--muted-foreground))] mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success))]" />
            Open for collaboration
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-[hsl(var(--foreground))] leading-[1.1] mb-5 animate-slide-up">
            Think together,<br />draw together.
          </h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-lg mx-auto mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            A collaborative canvas for teams who need a shared space to sketch ideas, plan projects, and build visual artifacts — together, in real-time.
          </p>
          <div className="flex items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/auth/sign-up" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition-opacity">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/sign-in" className="px-6 py-3 text-sm font-medium rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
              Sign in
            </Link>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1.5">
            <div className="rounded-xl bg-[hsl(var(--muted))] w-full aspect-[16/9] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--background))] flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
                </div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Canvas preview</p>
                <p className="text-xs text-[hsl(var(--muted-foreground)/0.7)] mt-1">Sign up to start drawing</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[hsl(var(--border))]">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-14">
              <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-3">Everything you need to collaborate</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md mx-auto">Built for teams who want a clean, fast, and secure way to work on visual ideas together.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
                    <div className="w-10 h-10 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                    </div>
                    <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-1.5">{f.title}</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-[hsl(var(--border))]">
          <div className="max-w-3xl mx-auto px-6 py-20 text-center">
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-3">Ready to get started?</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">Create your free account and start collaborating in seconds.</p>
            <Link href="/auth/sign-up" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition-opacity">
              Create free account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[hsl(var(--border))]">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[hsl(var(--foreground))] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
              </svg>
            </div>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">Canvas</span>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Collaborative workspace for teams</p>
        </div>
      </footer>
    </div>
  );
}
