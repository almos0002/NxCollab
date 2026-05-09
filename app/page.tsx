import Link from "next/link";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getBranding } from "@/lib/branding";
import { Layers, Users, Lock, History, Zap, ArrowRight, Shield, Pen, MousePointer2, GitBranch, Sparkles } from "lucide-react";

export async function generateMetadata() {
  const { siteName } = await getBranding();
  return { title: { absolute: `${siteName} — Collaborative Workspace` } };
}

function DefaultLogo({ size = 18, bgClass = "bg-[hsl(var(--foreground))]", fillColor = "hsl(var(--background))" }: { size?: number; bgClass?: string; fillColor?: string }) {
  const containerSize = size === 12 ? "w-6 h-6 rounded-md" : "w-8 h-8 rounded-lg";
  return (
    <div className={`${containerSize} ${bgClass} flex items-center justify-center`}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" fill={fillColor}/>
        <rect x="14" y="3" width="7" height="7" rx="1.5" fill={fillColor}/>
        <rect x="3" y="14" width="7" height="7" rx="1.5" fill={fillColor}/>
        <rect x="14" y="14" width="7" height="7" rx="1.5" fill={fillColor}/>
      </svg>
    </div>
  );
}

function CanvasIllustration() {
  return (
    <div className="relative w-full aspect-[16/9] rounded-xl bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border)/0.5)] overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="currentColor"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>

      <div className="absolute inset-0 p-6 sm:p-10">
        <div className="absolute top-[12%] left-[8%] bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl shadow-sm px-3 py-2 flex items-center gap-2 text-xs font-medium text-[hsl(var(--foreground))]">
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--foreground)/0.7)]" />
          Brainstorm session
        </div>

        <svg className="absolute top-[18%] left-[22%] w-[30%] opacity-60" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="88" height="44" rx="8" stroke="currentColor" strokeWidth="2" fill="none"/>
          <text x="46" y="28" textAnchor="middle" fontSize="10" fill="currentColor" fontFamily="system-ui">Design</text>
          <line x1="90" y1="24" x2="114" y2="24" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3"/>
          <polygon points="114,20 122,24 114,28" fill="currentColor"/>
          <rect x="122" y="2" width="76" height="44" rx="8" stroke="currentColor" strokeWidth="2" fill="none"/>
          <text x="160" y="28" textAnchor="middle" fontSize="10" fill="currentColor" fontFamily="system-ui">Build</text>
        </svg>

        <div className="absolute top-[48%] left-[10%] w-[22%] bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg shadow-sm p-3">
          <div className="h-1.5 w-3/4 rounded bg-[hsl(var(--foreground)/0.12)] mb-2" />
          <div className="h-1.5 w-1/2 rounded bg-[hsl(var(--foreground)/0.07)] mb-2" />
          <div className="h-1.5 w-2/3 rounded bg-[hsl(var(--foreground)/0.07)]" />
        </div>

        <svg className="absolute top-[35%] left-[36%] w-[18%] opacity-50" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="50" cy="50" rx="46" ry="46" stroke="currentColor" strokeWidth="2"/>
          <text x="50" y="55" textAnchor="middle" fontSize="11" fill="currentColor" fontFamily="system-ui">Idea</text>
        </svg>

        <div className="absolute bottom-[15%] left-[36%] bg-[hsl(var(--foreground))] text-[hsl(var(--background))] rounded-lg shadow px-3 py-1.5 text-[10px] font-semibold tracking-wide">
          Launch ✓
        </div>

        <svg className="absolute top-[10%] right-[12%] w-[24%] opacity-50" viewBox="0 0 120 120" fill="none">
          <path d="M20 60 Q60 10 100 60 Q60 110 20 60Z" stroke="currentColor" strokeWidth="2" fill="none"/>
          <text x="60" y="64" textAnchor="middle" fontSize="9" fill="currentColor" fontFamily="system-ui">Flow</text>
        </svg>

        <div className="absolute bottom-[18%] right-[8%] flex flex-col gap-1.5">
          {["Alex", "Sam", "Jordan"].map((name, i) => (
            <div key={i} className="flex items-center gap-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-full px-2 py-1 shadow-sm">
              <div className="w-4 h-4 rounded-full bg-[hsl(var(--foreground)/0.15)] flex items-center justify-center text-[8px] font-bold text-[hsl(var(--foreground))]">{name[0]}</div>
              <span className="text-[9px] font-medium text-[hsl(var(--foreground))]">{name}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            </div>
          ))}
        </div>

        <div className="absolute top-[62%] right-[18%] bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl shadow-sm p-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-2 h-2 rounded-sm bg-[hsl(var(--foreground)/0.8)]" />
            <div className="w-2 h-2 rounded-sm bg-[hsl(var(--foreground)/0.3)]" />
            <div className="w-2 h-2 rounded-sm bg-[hsl(var(--foreground)/0.15)]" />
          </div>
          <div className="h-0.5 w-10 rounded bg-[hsl(var(--border))]" />
        </div>

        <div className="absolute top-[30%] right-[6%] flex flex-col items-center gap-2">
          {[Pen, MousePointer2, Layers].map((Icon, i) => (
            <div key={i} className="w-8 h-8 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] flex items-center justify-center shadow-sm">
              <Icon className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function LandingPage() {
  const session = await getServerSession();
  if (session?.user) redirect("/dashboard");

  const { siteName, siteLogo } = await getBranding();

  const features = [
    { icon: Layers, title: "Infinite Canvas", desc: "Draw, sketch, and diagram on a boundless whiteboard powered by Excalidraw." },
    { icon: Users, title: "Real-time Collaboration", desc: "Work with your team live — see cursors and edits as they happen." },
    { icon: Lock, title: "End-to-End Encryption", desc: "AES-GCM encryption ensures only you and your team access your data." },
    { icon: History, title: "Version History", desc: "Restore any previous version of your canvas with a single click." },
    { icon: Zap, title: "Workspaces", desc: "Organize canvases, invite members, and control access with roles." },
    { icon: Shield, title: "Role-Based Access", desc: "Fine-grained permissions — owners, admins, members, and viewers." },
  ];

  const steps = [
    { num: "01", icon: GitBranch, title: "Create a workspace", desc: "Set up a shared space for your team or project in seconds." },
    { num: "02", icon: Users, title: "Invite your team", desc: "Share a link or send invites — teammates join with one click." },
    { num: "03", icon: Sparkles, title: "Start creating", desc: "Open an infinite canvas and bring your ideas to life together." },
  ];

  const stats = [
    { value: "∞", label: "Canvas size" },
    { value: "50", label: "Version snapshots" },
    { value: "4", label: "Role levels" },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--background)/0.85)] backdrop-blur-xl border-b border-[hsl(var(--border)/0.5)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="w-8 h-8 object-contain" />
            ) : (
              <DefaultLogo />
            )}
            <span className="font-bold text-[hsl(var(--foreground))]">{siteName}</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-[hsl(var(--muted-foreground))]">
            <a href="#features" className="hover:text-[hsl(var(--foreground))] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[hsl(var(--foreground))] transition-colors">How it works</a>
          </nav>
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
        {/* Hero */}
        <section className="relative pt-36 pb-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[hsl(var(--foreground)/0.03)] blur-3xl" />
            <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full bg-[hsl(var(--foreground)/0.02)] blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-[600px] h-[300px] rounded-full bg-[hsl(var(--foreground)/0.02)] blur-3xl" />
          </div>

          <div className="relative max-w-5xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-xs font-medium text-[hsl(var(--muted-foreground))] mb-6 animate-slide-up">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--foreground))] animate-pulse" />
                  Built for creative teams
                </div>

                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-[hsl(var(--foreground))] leading-[1.08] mb-5 animate-slide-up">
                  Think together,
                  <br />
                  <span className="relative inline-block">
                    <span className="text-[hsl(var(--muted-foreground))]">draw together.</span>
                    <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 8" fill="none" preserveAspectRatio="none">
                      <path d="M2 6 C 60 2, 240 2, 298 6" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" opacity="0.2"/>
                    </svg>
                  </span>
                </h1>

                <p className="text-base text-[hsl(var(--muted-foreground))] max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
                  A shared space to sketch ideas, plan projects, and build visual artifacts — together, in real-time. Encrypted and version-controlled.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 animate-slide-up" style={{ animationDelay: "0.15s" }}>
                  <Link href="/auth/sign-up" className="inline-flex items-center gap-2.5 px-6 py-3 text-sm font-semibold rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition-opacity shadow-sm">
                    Start for free <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/auth/sign-in" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
                    Sign in
                  </Link>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-6 mt-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  {stats.map((s, i) => (
                    <div key={i} className="text-center lg:text-left">
                      <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{s.value}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 w-full max-w-xl lg:max-w-none animate-slide-up" style={{ animationDelay: "0.25s" }}>
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-sm">
                  <CanvasIllustration />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Scrolling badge strip */}
        <div className="border-y border-[hsl(var(--border))] py-3 overflow-hidden bg-[hsl(var(--muted)/0.3)]">
          <div className="flex gap-8 animate-none whitespace-nowrap">
            {["Infinite canvas", "Real-time collaboration", "Version history", "End-to-end encryption", "Role-based access", "Workspace management", "Invite links", "Auto-save", "Infinite canvas", "Real-time collaboration", "Version history", "End-to-end encryption"].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-xs font-medium text-[hsl(var(--muted-foreground))] shrink-0">
                <span className="w-1 h-1 rounded-full bg-[hsl(var(--foreground)/0.25)]" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Features */}
        <section id="features" className="max-w-6xl mx-auto px-6 py-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-3">Features</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight">Everything you need<br />to collaborate</h2>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs leading-relaxed">
              Built for teams who want a clean, fast, and secure way to work on visual ideas together.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[hsl(var(--border))] rounded-2xl overflow-hidden border border-[hsl(var(--border))]">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="group bg-[hsl(var(--card))] p-7 hover:bg-[hsl(var(--accent)/0.4)] transition-colors relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-[hsl(var(--foreground)/0.04)] font-black text-5xl leading-none select-none">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="w-10 h-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] flex items-center justify-center mb-5 group-hover:border-[hsl(var(--foreground)/0.2)] transition-colors">
                    <Icon className="w-[18px] h-[18px] text-[hsl(var(--foreground))]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-2">{f.title}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.2)]">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-3">How it works</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight mb-4">Up and running in minutes</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-sm mx-auto leading-relaxed">No complicated setup. Create a workspace, invite your team, and start building.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
              <div className="hidden sm:block absolute top-8 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-[hsl(var(--border))]" />
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="relative flex flex-col items-center text-center p-6">
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] flex items-center justify-center mb-5 shadow-sm">
                      <Icon className="w-6 h-6 text-[hsl(var(--foreground))]" />
                      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[9px] font-black flex items-center justify-center">
                        {i + 1}
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-2">{s.title}</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{s.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <Link href="/auth/sign-up" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition-opacity">
                Get started for free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="relative rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--foreground))] overflow-hidden">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <svg className="absolute -top-16 -right-16 w-80 h-80 opacity-[0.06]" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="1"/>
                <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="1"/>
                <circle cx="100" cy="100" r="30" stroke="white" strokeWidth="1"/>
              </svg>
              <svg className="absolute -bottom-12 -left-12 w-64 h-64 opacity-[0.06]" viewBox="0 0 200 200" fill="none">
                <rect x="20" y="20" width="160" height="160" rx="20" stroke="white" strokeWidth="1"/>
                <rect x="50" y="50" width="100" height="100" rx="12" stroke="white" strokeWidth="1"/>
              </svg>
            </div>
            <div className="relative px-8 sm:px-16 py-16 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[hsl(var(--background)/0.2)] text-[hsl(var(--background))] text-xs font-medium mb-5 opacity-70">
                <Sparkles className="w-3 h-3" />
                Free to get started
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--background))] tracking-tight mb-4">Ready to collaborate?</h2>
              <p className="text-sm text-[hsl(var(--background)/0.65)] mb-8 max-w-sm mx-auto leading-relaxed">
                Create your free account and start building on an infinite canvas with your team today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/auth/sign-up" className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold rounded-xl bg-[hsl(var(--background))] text-[hsl(var(--foreground))] hover:opacity-90 transition-opacity shadow-sm">
                  Create free account <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/auth/sign-in" className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium rounded-xl border border-[hsl(var(--background)/0.2)] text-[hsl(var(--background))] hover:bg-[hsl(var(--background)/0.08)] transition-colors">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[hsl(var(--border))]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="w-6 h-6 object-contain" />
            ) : (
              <DefaultLogo size={12} />
            )}
            <span className="text-sm font-medium text-[hsl(var(--foreground))]">{siteName}</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[hsl(var(--muted-foreground))]">
            <a href="#features" className="hover:text-[hsl(var(--foreground))] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[hsl(var(--foreground))] transition-colors">How it works</a>
            <Link href="/auth/sign-up" className="hover:text-[hsl(var(--foreground))] transition-colors">Get started</Link>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Collaborative workspace for teams</p>
        </div>
      </footer>
    </div>
  );
}
