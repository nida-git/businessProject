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
      icon: <Landmark className="h-8 w-8 text-[#193f34]" />,
      title: "Fund Operations",
      description:
        "Track portfolio strategy, fund activity, and performance across every active investment cycle.",
    },
    {
      icon: <BriefcaseBusiness className="h-8 w-8 text-[#193f34]" />,
      title: "LP Oversight",
      description:
        "Manage commitments, ownership, and capital calls with a single source of truth for all investors.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-[#193f34]" />,
      title: "Returns & Distributions",
      description:
        "Monitor equalization, distributions, and investor performance with transparent, auditable metrics.",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-[#193f34]" />,
      title: "Secure Access",
      description:
        "Role-based user separation ensures every team and partner operates in their own protected workspace.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f3ec] text-[#17392f]">
      <header className="mx-auto max-w-7xl px-6 py-6">
        <nav className="flex items-center justify-between rounded-full border border-[#d8cec0] bg-[#f4f0ea]/90 px-5 py-3 shadow-[0_10px_30px_rgba(25,63,52,0.05)] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#193f34] text-sm font-bold text-[#f7f3ec]">
              EX
            </div>
            <div>
              <div className="text-lg font-semibold tracking-[0.18em] text-[#17392f] uppercase">
                EquityX
              </div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-[#547767]">
                Private Equity
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-sm text-[#3d524d] md:flex">
            <a href="#platform" className="transition hover:text-[#193f34]">
              Platform
            </a>
            <a href="#features" className="transition hover:text-[#193f34]">
              Features
            </a>
            <a href="#insights" className="transition hover:text-[#193f34]">
              Insights
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-full border border-[#193f34] px-4 py-2 text-sm font-medium text-[#193f34] transition hover:bg-[#193f34] hover:text-[#f7f3ec]"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-[#193f34] px-4 py-2 text-sm font-semibold text-[#f7f3ec] transition hover:bg-[#264d42]"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-16 pt-10 md:grid-cols-[1.15fr_0.85fr] md:items-center md:pt-16">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-[#c9d6cf] bg-[#eaf0ee] px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-[#36584f]">
              Fund intelligence for modern investment teams
            </div>
            <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight text-[#17392f] md:text-6xl">
              Build smarter capital strategies.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#415b57]">
              EquityX brings together LP operations, capital calls, close
              management, and portfolio performance in one elegant platform
              designed for growth-focused private equity firms.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-[#193f34] px-6 py-3 font-semibold text-[#f7f3ec] transition hover:-translate-y-0.5 hover:bg-[#264d42]"
              >
                Start Managing Capital <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-[#c9d6cf] bg-[#fffdfb] px-6 py-3 font-semibold text-[#17392f] transition hover:border-[#193f34] hover:text-[#193f34]"
              >
                Sign In
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-8 text-sm text-[#415b57]">
              <div>
                <span className="font-semibold text-[#17392f]">12k+</span> LP
                records
              </div>
              <div>
                <span className="font-semibold text-[#17392f]">98%</span>{" "}
                reporting accuracy
              </div>
              <div>
                <span className="font-semibold text-[#17392f]">24/7</span>{" "}
                secure access
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-[#dfeae7] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-[#d8cec0] bg-[#fffdfb] p-6 shadow-[0_25px_60px_rgba(25,63,52,0.12)]">
              <div className="rounded-[1.4rem] border border-[#e4ddd3] bg-[#f7f3ec] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#547767]">
                      Portfolio Overview
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-[#17392f]">
                      EquityX Fund
                    </h3>
                  </div>
                  <div className="rounded-full bg-[#dfeae7] px-3 py-1 text-sm font-medium text-[#193f34]">
                    +18.4%
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#d8cec0] bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#587269]">
                      Committed
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-[#17392f]">
                      ₹248M
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#d8cec0] bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#587269]">
                      Distributed
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-[#17392f]">
                      ₹96M
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[#d8cec0] bg-white p-4">
                  <div className="mb-3 flex items-center justify-between text-sm text-[#415b57]">
                    <span>Capital Calls</span>
                    <span className="text-[#193f34]">78% complete</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#edf1ee]">
                    <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-[#193f34] to-[#547767]" />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    ["Investor Pool", "₹126.4M"],
                    ["Portfolio Companies", "8 Active"],
                    ["Equalization", "₹4.7M"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-xl border border-[#d8cec0] bg-white px-4 py-3 text-sm text-[#415b57]"
                    >
                      <span>{label}</span>
                      <span className="font-semibold text-[#17392f]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[#547767]">
              Platform capability
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-[#17392f]">
              Everything governing your private capital ecosystem
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-[1.75rem] border border-[#d8cec0] bg-[#fffdfb] p-6 shadow-[0_12px_25px_rgba(25,63,52,0.04)] transition duration-300 hover:-translate-y-1 hover:border-[#193f34]/50 hover:shadow-[0_18px_35px_rgba(25,63,52,0.08)]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf1ee]">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#17392f]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#415b57]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="insights"
          className="border-t border-[#e2d9d1] bg-[#f2eee7] px-6 py-20"
        >
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-[#d8cec0] bg-white p-7 shadow-[0_12px_25px_rgba(25,63,52,0.04)]">
              <p className="text-sm uppercase tracking-[0.25em] text-[#547767]">
                LP management
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-[#17392f]">
                Investor visibility
              </h3>
              <p className="mt-3 text-[#415b57]">
                Maintain a clean perspective across commitments, capital calls,
                ownership, and late-stage equalization.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-[#d8cec0] bg-white p-7 shadow-[0_12px_25px_rgba(25,63,52,0.04)]">
              <p className="text-sm uppercase tracking-[0.25em] text-[#547767]">
                Portfolio tracking
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-[#17392f]">
                Operational clarity
              </h3>
              <p className="mt-3 text-[#415b57]">
                Monitor companies, fundraising activity, distributions, and
                close timing from a single operating dashboard.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-[#d8cec0] bg-white p-7 shadow-[0_12px_25px_rgba(25,63,52,0.04)]">
              <p className="text-sm uppercase tracking-[0.25em] text-[#547767]">
                Governance
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-[#17392f]">
                Secure decision-making
              </h3>
              <p className="mt-3 text-[#415b57]">
                Role-based access, approval flow, and account controls keep
                investor and administrative workflows protected.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#ded0c5] bg-[#f7f3ec] px-6 py-8 text-center text-sm text-[#415b57]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="font-medium text-[#17392f]">EquityX</div>
          <div>Private Equity Fund Management Platform</div>
          <div>© 2026 EquityX Capital</div>
        </div>
      </footer>
    </div>
  );
}
