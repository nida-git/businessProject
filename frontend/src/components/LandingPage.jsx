import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const features = [
    {
      icon: <Landmark className="h-8 w-8 text-[#d4af69]" />,
      title: "Fund Operations",
      description:
        "Track portfolio strategy, fund activity, and performance across every active investment cycle.",
    },
    {
      icon: <BriefcaseBusiness className="h-8 w-8 text-[#d4af69]" />,
      title: "LP Oversight",
      description:
        "Manage commitments, ownership, and capital calls with a single source of truth for all investors.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-[#d4af69]" />,
      title: "Returns & Distributions",
      description:
        "Monitor equalization, distributions, and investor performance with transparent, auditable metrics.",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-[#d4af69]" />,
      title: "Secure Access",
      description:
        "Role-based user separation ensures every team and partner operates in their own protected workspace.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b1117] text-[#f7f3ec]">
      <header className="mx-auto max-w-7xl px-6 py-6">
        <nav className="flex items-center justify-between rounded-full border border-[#2a312e] bg-[#111a1d]/80 px-5 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d4af69] text-[#0b1117] font-bold">
              PE
            </div>
            <div>
              <div className="text-lg font-semibold tracking-[0.2em] uppercase">
                Meridian
              </div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-[#d4af69]">
                Private Equity
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-8 md:flex text-sm text-[#efe6d8]">
            <a href="#platform" className="transition hover:text-[#d4af69]">
              Platform
            </a>
            <a href="#features" className="transition hover:text-[#d4af69]">
              Features
            </a>
            <a href="#insights" className="transition hover:text-[#d4af69]">
              Insights
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-full border border-[#d4af69] px-4 py-2 text-sm font-medium text-[#f7f3ec] transition hover:bg-[#d4af69] hover:text-[#0b1117]"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-[#d4af69] px-4 py-2 text-sm font-semibold text-[#0b1117] transition hover:brightness-110"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-16 pt-10 md:grid-cols-[1.15fr_0.85fr] md:items-center md:pt-16">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-[#d4af69]/40 bg-[#d4af69]/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-[#f1d7a1]">
              Fund intelligence for modern investment teams
            </div>
            <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
              Build smarter capital strategies.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#dfe5e0]">
              Meridian PE brings together LP operations, capital calls, close
              management, and portfolio performance in one elegant platform
              designed for growth-focused private equity firms.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-[#d4af69] px-6 py-3 font-semibold text-[#0b1117] transition hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(212,175,105,0.35)]"
              >
                Start Managing Capital <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-[#2a312e] bg-transparent px-6 py-3 font-semibold text-[#f7f3ec] transition hover:border-[#d4af69] hover:text-[#d4af69]"
              >
                Sign In
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-8 text-sm text-[#dfe5e0]">
              <div>
                <span className="font-semibold text-white">12k+</span> LP
                records
              </div>
              <div>
                <span className="font-semibold text-white">98%</span> reporting
                accuracy
              </div>
              <div>
                <span className="font-semibold text-white">24/7</span> secure
                access
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#d4af69]/20 via-transparent to-[#0b1117] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-[#2a312e] bg-[#111a1d] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <div className="rounded-[1.4rem] border border-[#2a312e] bg-[#0d1519] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#d4af69]">
                      Portfolio Overview
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      Northbridge Fund
                    </h3>
                  </div>
                  <div className="rounded-full bg-[#173128] px-3 py-1 text-sm font-medium text-[#bef0d0]">
                    +18.4%
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#2a312e] bg-[#141d22] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#dfe5e0]">
                      Committed
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-white">
                      $248M
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#2a312e] bg-[#141d22] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#dfe5e0]">
                      Distributed
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-white">
                      $96M
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[#2a312e] bg-[#141d22] p-4">
                  <div className="mb-3 flex items-center justify-between text-sm text-[#dfe5e0]">
                    <span>Capital Calls</span>
                    <span className="text-[#d4af69]">78% complete</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#1f2a2d]">
                    <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-[#d4af69] to-[#f3d58f]" />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    ["Investor Pool", "$126.4M"],
                    ["Portfolio Companies", "8 Active"],
                    ["Equalization", "$4.7M"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-xl border border-[#2a312e] bg-[#141d22] px-4 py-3 text-sm text-[#dfe5e0]"
                    >
                      <span>{label}</span>
                      <span className="font-semibold text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[#d4af69]">
              Platform capability
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-white">
              Everything governing your private capital ecosystem
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-[1.75rem] border border-[#2a312e] bg-[#10181b] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#d4af69]/60 hover:shadow-[0_20px_40px_rgba(212,175,105,0.15)]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171f22]">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#dfe5e0]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="insights"
          className="border-t border-[#1f2c2d] bg-[#0e171a] px-6 py-20"
        >
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-[#2a312e] bg-[#111a1d] p-7">
              <p className="text-sm uppercase tracking-[0.25em] text-[#d4af69]">
                LP management
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-white">
                Investor visibility
              </h3>
              <p className="mt-3 text-[#dfe5e0]">
                Maintain a clean perspective across commitments, capital calls,
                ownership, and late-stage equalization.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-[#2a312e] bg-[#111a1d] p-7">
              <p className="text-sm uppercase tracking-[0.25em] text-[#d4af69]">
                Portfolio tracking
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-white">
                Operational clarity
              </h3>
              <p className="mt-3 text-[#dfe5e0]">
                Monitor companies, fundraising activity, distributions, and
                close timing from a single operating dashboard.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-[#2a312e] bg-[#111a1d] p-7">
              <p className="text-sm uppercase tracking-[0.25em] text-[#d4af69]">
                Governance
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-white">
                Secure decision-making
              </h3>
              <p className="mt-3 text-[#dfe5e0]">
                Role-based access, approval flow, and account controls keep
                investor and administrative workflows protected.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1f2c2d] bg-[#0b1117] px-6 py-8 text-center text-sm text-[#dfe5e0]">
        <div className="mx-auto max-w-7xl flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="font-medium text-white">Meridian PE</div>
          <div>Private Equity Fund Management Platform</div>
          <div>© 2026 Meridian Capital</div>
        </div>
      </footer>
    </div>
  );
}
