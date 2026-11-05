
import { useState } from "react";
import {
  LayoutDashboard, Users, Building2, FileBarChart,
  Settings, Landmark, Database, TrendingUp,
  Handshake, UserRound, CalendarDays, Sprout
} from "lucide-react";

export default function App() {
  const [fundName, setFundName] = useState("");

  const [lpName, setLpName] = useState("");
  const [commitment, setCommitment] = useState("");
  const [joinDate, setJoinDate] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [investment, setInvestment] = useState("");

  const [lps, setLps] = useState([
    { name: "ABC Capital", commitment: 50, call: 30, date: "Jan 2024", equalization: 5 },
    { name: "XYZ Investments", commitment: 60, call: 35, date: "Mar 2024", equalization: 6 },
    { name: "Global Partners", commitment: 40, call: 25, date: "Jun 2024", equalization: 4 },
  ]);

  const [companies, setCompanies] = useState([
    { name: "TechNova Inc.", amount: 40, sector: "Technology" },
    { name: "HealthPlus Ltd.", amount: 30, sector: "Healthcare" },
  ]);

  const totalCommitment = lps.reduce((sum, lp) => sum + lp.commitment, 0);
  const totalCall = lps.reduce((sum, lp) => sum + lp.call, 0);

  const addLP = () => {
    if (!lpName || !commitment || !joinDate) return;

    setLps([...lps, {
      name: lpName,
      commitment: Number(commitment),
      call: 0,
      date: new Date(joinDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      equalization: 0,
    }]);

    setLpName("");
    setCommitment("");
    setJoinDate("");
  };

  const addCompany = () => {
    if (!companyName || !investment) return;

    setCompanies([...companies, {
      name: companyName,
      amount: Number(investment),
      sector: "Other",
    }]);

    setCompanyName("");
    setInvestment("");
  };

  return (
    <div className="min-h-screen flex bg-[#f7f3ec] text-[#172d27]"
      style={{ fontFamily: "Georgia, serif" }}>

      {/* SIDEBAR */}
      <aside className="w-[246px] min-h-screen bg-[#193f34] text-[#f8f4eb] 
        flex flex-col shrink-0 max-md:w-[75px]">

        <div className="py-12 text-center">
          <Sprout size={65} strokeWidth={1.2} className="mx-auto mb-3" />
          <h2 className="text-2xl font-bold max-md:hidden">PE Fund</h2>
        </div>

        <nav className="px-3 space-y-2 text-lg">
          {[
            [LayoutDashboard, "Dashboard"],
            [Users, "LPs"],
            [Building2, "Companies"],
            [FileBarChart, "Reports"],
            [Settings, "Settings"],
          ].map(([Icon, label], index) => (
            <div key={label}
              className={`flex items-center gap-5 px-5 py-4 rounded-xl cursor-pointer
              ${index === 0 ? "bg-[#f6f0e6] text-[#193f34]" : "hover:bg-[#31574c]"}`}>
              <Icon size={24} />
              <span className="max-md:hidden">{label}</span>
            </div>
          ))}
        </nav>

        <div className="mt-auto opacity-30 pb-5">
          <Sprout size={150} strokeWidth={1} />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 p-9 max-md:p-4">

        {/* HEADER */}
        <header className="flex justify-between items-start mb-9">
          <div>
            <h1 className="text-4xl font-bold text-[#193f34] max-md:text-2xl">
              Private Equity Fund
            </h1>
            <p className="text-xl mt-2">Track · Manage · Grow</p>
          </div>

          <button className="border border-[#ddd3c5] rounded-2xl px-5 py-3 flex gap-3 items-center">
            <UserRound size={20} /> GP
          </button>
        </header>

        {/* SUMMARY CARDS */}
        <section className="grid grid-cols-4 gap-5 mb-9 max-xl:grid-cols-2 max-sm:grid-cols-1">

          <SummaryCard icon={<Users size={52} fill="#193f34" />} 
            value={lps.length} label="Total Limited Partners" />

          <SummaryCard icon={<Database size={52} fill="#193f34" />} 
            value={`₹ ${totalCommitment}`} label="Total Commitment" />

          <SummaryCard icon={<TrendingUp size={52} />} 
            value={`₹ ${totalCall}`} label="Total Capital Call" />

          <SummaryCard icon={<Handshake size={52} fill="#193f34" />} 
            value={companies.length} label="Total Companies" />

        </section>

        {/* DASHBOARD BODY */}
        <div className="grid grid-cols-[minmax(350px,0.75fr)_minmax(0,1.4fr)] gap-4 
          max-xl:grid-cols-1">

          {/* LEFT SIDE FORMS */}
          <section className="border border-[#e2d9cc] rounded-2xl p-5 bg-[#faf7f1]">

            {/* FUND DETAILS */}
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-5">
              <Landmark size={30} /> Fund Details
            </h2>

            <label className="block mb-2">Fund Name</label>

            <div className="flex gap-3">
              <input
                value={fundName}
                placeholder="Enter Fund Name"
                onChange={(e) => setFundName(e.target.value)}
                className="input-style flex-1 min-w-0"
              />
              <button className="green-button">Save</button>
            </div>

            <hr className="my-7 border-[#ded5c8]" />

            {/* ADD LP */}
            <h3 className="font-semibold mb-3 text-lg">
              Add Limited Partner (LP)
            </h3>

            <div className="flex flex-wrap gap-2">
              <input
                placeholder="Name"
                value={lpName}
                onChange={(e) => setLpName(e.target.value)}
                className="input-style min-w-0 flex-1"
              />

              <input
                type="number"
                placeholder="Commitment (USD M)"
                value={commitment}
                onChange={(e) => setCommitment(e.target.value)}
                className="input-style min-w-0 flex-1"
              />

              <input
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                className="input-style min-w-0 flex-1"
              />

              <button onClick={addLP} className="green-button">
                Add
              </button>
            </div>

            <hr className="my-7 border-[#ded5c8]" />

            {/* ADD COMPANY */}
            <h3 className="font-semibold mb-3 text-lg">
              Add Company
            </h3>

            <div className="flex flex-wrap gap-2">
              <input
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input-style min-w-0 flex-1"
              />

              <input
                type="number"
                placeholder="Investment Requirement"
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
                className="input-style min-w-0 flex-1"
              />

              <button onClick={addCompany} className="green-button">
                Add
              </button>
            </div>

            {/* DECORATIVE CHART */}
            <div className="mt-12 h-28 flex items-end justify-center gap-5 relative">
              {[20, 30, 40, 50, 65, 80, 100].map((height, i) => (
                <div key={i}
                  style={{ height: `${height}%` }}
                  className="w-5 bg-[#547767] rounded-t-sm opacity-80"
                />
              ))}
              <TrendingUp className="absolute -top-2 right-10 text-[#819783]"
                size={35} />
            </div>

          </section>

          {/* RIGHT SIDE TABLES */}
          <section className="space-y-4 min-w-0">

            {/* LP TABLE */}
            <div className="border border-[#e2d9cc] rounded-2xl p-4 bg-[#faf7f1]">

              <h2 className="text-2xl font-bold flex items-center gap-3 mb-5">
                <Users size={30} fill="#193f34" />
                Limited Partners
              </h2>

              <div className="overflow-x-auto rounded-xl border border-[#e2d9cc]">
                <table className="w-full text-left text-base whitespace-nowrap">
                  <thead className="bg-[#193f34] text-white">
                    <tr>
                      <th className="table-heading">Name</th>
                      <th className="table-heading">Commitment</th>
                      <th className="table-heading">Capital Call</th>
                      <th className="table-heading">Date of Join</th>
                      <th className="table-heading">Equalization Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {lps.map((lp, index) => (
                      <tr key={index} className="border-b hover:bg-[#e8e0d4] border-[#e2d9cc]">
                        <td className="table-cell">{lp.name}</td>
                        <td className="table-cell">₹ {lp.commitment}</td>
                        <td className="table-cell">₹ {lp.call}</td>
                        <td className="table-cell">{lp.date}</td>
                        <td className="table-cell">₹ {lp.equalization}M</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* COMPANY TABLE */}
            <div className="border border-[#e2d9cc] rounded-2xl p-4 bg-[#faf7f1]">

              <h2 className="text-2xl font-bold flex items-center gap-3 mb-5">
                <Building2 size={30} />
                Company Details
              </h2>

              <div className="overflow-x-auto rounded-xl border border-[#e2d9cc]">
                <table className="w-full text-left text-base whitespace-nowrap">
                  <thead className="bg-[#193f34] text-white">
                    <tr>
                      <th className="table-heading">Company Name</th>
                      <th className="table-heading">Investment Amount</th>
                      <th className="table-heading">Sector</th>
                      <th className="table-heading">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {companies.map((company, index) => (
                      <tr key={index} className="border-b hover:bg-[#e8e0d4] border-[#e2d9cc]">
                        <td className="table-cell">{company.name}</td>
                        <td className="table-cell">₹ {company.amount}</td>
                        <td className="table-cell">{company.sector}</td>
                        <td className="table-cell">
                          <span className="bg-[#d8ead4] text-[#315b3b] rounded-full px-3 py-1 text-sm">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ icon, value, label }) {
  return (
    <div className="bg-[#f1ebe2] hover:bg-[#e8e0d4] border border-[#e3d9cc] rounded-2xl p-6
      flex items-center gap-6 min-h-[124px]">
      <div className="text-[#193f34] shrink-0">{icon}</div>
      <div>
        <h2 className="text-3xl font-bold">{value}</h2>
        <p className="mt-2 text-base whitespace-nowrap">{label}</p>
      </div>
    </div>
  );
}
