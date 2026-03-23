import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Layers, Users, Lock, History, Zap, ArrowRight, Shield, Pen } from "lucide-react";

export const metadata: Metadata = { title: "Canvas — Collaborative Workspace" };

export default async function LandingPage() {
  const session = await getServerSession();
  if (session?.user) redirect("/dashboard");

  const features = [
    { icon: Layers, title: "Infinite Canvas", desc: "Draw, sketch, and diagram on a boundless whiteboard powered by Excalidraw." },
    { icon: Users, title: "Real-time Collaboration", desc: "Work with your team live — see cursors and edits as they happen." },
    { icon: Lock, title: "End-to-End Encryption", desc: "AES-GCM encryption ensures only you and your team access your data." },
    { icon: History, title: "Version History", desc: "Restore any previous version of your canvas with a single click." },
    { icon: Zap, title: "Workspaces", desc: "Organize canvases, invite members, and control access with roles." },
    { icon: Shield, title: "Role-Based Access", desc: "Fine-grained permissions — owners, admins, members, and viewers." },
  ];

  const steps = [
    { num: "01", title: "Create a workspace", desc: "Set up a shared space for your team or project in seconds." },
    { num: "02", title: "Invite your team", desc: "Share a link or send invites — teammates join with one click." },
    { num: "03", title: "Start creating", desc: "Open an infinite canvas and bring your ideas to life together." },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--background)/0.8)] backdrop-blur-xl border-b border-[hsl(var(--border)/0.5)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--foreground))] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
              </svg>
            </div>
            <span className="font-bold text-[hsl(var(--foreground))]">Canvas</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/sign-in" className="px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors rounded-lg hover:bg-[hsl(var(--accent)/0.5)]">
              Sign in
            </Link>
            <Link href="/auth/sign-up" className="px-4 py-2 text-sm font-medium rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition-opacity">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[hsl(var(--foreground)/0.02)] blur-3xl" />
          </div>

          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[hsl(var(--foreground))] leading-[1.05] mb-6 animate-slide-up">
              Think together,
              <br />
              <span className="text-[hsl(var(--muted-foreground))]">draw together.</span>
            </h1>

            <p className="text-base sm:text-lg text-[hsl(var(--muted-foreground))] max-w-xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
              A shared space to sketch ideas, plan projects, and build visual
              artifacts — together, in real-time. Encrypted and version-controlled.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <Link href="/auth/sign-up" className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-medium rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition-opacity shadow-sm">
                Start for free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/sign-in" className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-28 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-sm">
            <div className="rounded-xl bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border)/0.5)] w-full aspect-[16/8.5] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0">
                <svg className="w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              <div className="relative flex flex-col items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] flex items-center justify-center shadow-sm">
                    <Pen className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] flex items-center justify-center shadow-sm">
                    <Layers className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] flex items-center justify-center shadow-sm">
                    <Users className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">Your canvas, your way</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Sign up to start drawing on an infinite whiteboard</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[hsl(var(--border))]">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="max-w-xl mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-3">Features</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight mb-4">Everything you need to collaborate</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">Built for teams who want a clean, fast, and secure way to work on visual ideas together.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="group rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 hover:border-[hsl(var(--foreground)/0.15)] transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--foreground)/0.05)] flex items-center justify-center mb-5 group-hover:bg-[hsl(var(--foreground)/0.08)] transition-colors">
                      <Icon className="w-[18px] h-[18px] text-[hsl(var(--foreground))]" />
                    </div>
                    <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-2">{f.title}</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-[hsl(var(--border))]">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-3">How it works</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight mb-4">Up and running in minutes</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-10">No complicated setup. Create a workspace, invite your team, and start building together.</p>
                <Link href="/auth/sign-up" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition-opacity">
                  Get started <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-1">
                {steps.map((s, i) => (
                  <div key={i} className="flex gap-5 p-5 rounded-2xl hover:bg-[hsl(var(--accent)/0.4)] transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))] flex items-center justify-center shrink-0 text-xs font-bold">{s.num}</div>
                    <div>
                      <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-1">{s.title}</h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[hsl(var(--border))]">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
              <div className="px-8 sm:px-16 py-16 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight mb-4">Ready to collaborate?</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-8 max-w-md mx-auto leading-relaxed">Create your free account and start building on an infinite canvas with your team.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/auth/sign-up" className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-medium rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition-opacity">
                    Create free account <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/auth/sign-in" className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[hsl(var(--border))]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[hsl(var(--foreground))] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="hsl(var(--background))"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-[hsl(var(--foreground))]">Canvas</span>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Collaborative workspace for teams</p>
        </div>
      </footer>
    </div>
  );
}
