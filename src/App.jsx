import { useState, useMemo, useEffect } from "react";
// import { calculateLPs } from "./utils/fundCalculations";
//
import { calculateLPs, getNextClose } from "./utils/fundCalculations";
import {
  Users,
  Building2,
  Landmark,
  Database,
  TrendingUp,
  Handshake,
  UserRound,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/lps";

export default function App() {
  const [fundName, setFundName] = useState("");
  const [editingLP, setEditingLP] = useState(null);
  const [newCloseDate, setNewCloseDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [lps, setLps] = useState([]);
  const [mergedCloseDates, setMergedCloseDates] = useState([]);
  const [lastMergedClose, setLastMergedClose] = useState(null);

  const [lpName, setLpName] = useState("");
  const [commitment, setCommitment] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [companies, setCompanies] = useState([
    {
      id: "technova-inc",
      name: "TechNova Inc.",
      requirement: 40,
      profit: 0,
      sector: "Technology",
      isActive: true,
    },
    {
      id: "healthplus-ltd",
      name: "HealthPlus Ltd.",
      requirement: 30,
      profit: 0,
      sector: "Healthcare",
      isActive: true,
    },
  ]);
  const [companyName, setCompanyName] = useState("");
  const [requirement, setRequirement] = useState("");

  const activeCompanies = useMemo(
    () => companies.filter((company) => company.isActive !== false),
    [companies],
  );

  // const calculatedLPs = useMemo(
  //   () => calculateLPs(lps, activeCompanies),
  //   [lps, activeCompanies],
  // );
  const calculatedLPs = useMemo(
    () => calculateLPs(lps, activeCompanies, mergedCloseDates),
    [lps, activeCompanies, mergedCloseDates],
  );

  const nextClose = useMemo(
    () => getNextClose(lps, activeCompanies, mergedCloseDates),
    [lps, activeCompanies, mergedCloseDates],
  );

  //  const mergeClose = async () => {
  //   if (!nextClose) {
  //     alert("No pending close available.");
  //     return;
  //   }

  //   const confirmed = window.confirm(
  //     `Merge close dated ${nextClose.date}?`
  //   );

  //   if (!confirmed) return;

  //   try {
  //     const response = await fetch(
  //       "http://localhost:5000/api/closes/merge",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ date: nextClose.date }),
  //       }
  //     );

  //     const result = await response.json();

  //     if (!response.ok) {
  //       throw new Error(result.message || "Merge failed");
  //     }

  //     // Support either direct or nested backend responses
  //     const mergedDates =
  //       result.mergedDates || result.data?.mergedDates || [];

  //     setMergedCloseDates(mergedDates);

  //     setLastMergedClose({
  //       date: nextClose.date,
  //       previousDate: nextClose.previousDate,
  //       days: nextClose.days,
  //       totalEqualization: nextClose.totalEqualization,
  //       lps: nextClose.lps.map((lp) => ({
  //         ...lp,
  //         equalization: Math.round(
  //           (lp.capitalCall * 0.1 * nextClose.days) / 365
  //         ),
  //       })),
  //     });

  //     alert("Close merged successfully!");
  //   } catch (error) {
  //     console.error("Merge error:", error);
  //     alert(error.message);
  //   }
  // };

  const mergeClose = async () => {
    if (!nextClose) {
      alert("No pending close available.");
      return;
    }

    const confirmed = window.confirm(`Merge close dated ${nextClose.date}?`);

    if (!confirmed) return;

    try {
      const response = await fetch("http://localhost:5000/api/closes/merge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: nextClose.date,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Merge failed");
      }

      const mergedDates = result.mergedDates || result.data?.mergedDates || [];

      setMergedCloseDates(mergedDates);

      setLastMergedClose({
        date: nextClose.date,
        previousDate: nextClose.previousDate,
        days: nextClose.days,
        totalEqualization: nextClose.totalEqualization,
        lps: nextClose.lps,
      });

      alert("Close merged successfully!");
    } catch (error) {
      console.error("Merge error:", error);
      alert(error.message);
    }
  };
  const fetchCloses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/closes");

      const result = await response.json();

      if (!response.ok) {
        throw new Error("Failed to load closes");
      }

      setMergedCloseDates(result.mergedDates || result.data?.mergedDates || []);
    } catch (error) {
      console.error("Error loading closes:", error);
    }
  };
  useEffect(() => {
    const fetchLPs = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch LPs");
        }

        const data = await response.json();

        const mappedLps = data.map((lp) => ({
          id: lp._id || crypto.randomUUID(),
          name: lp.name,
          commitment: Number(lp.commitment),
          dateOfJoin: lp.dateOfJoin,
        }));

        setLps(mappedLps);
      } catch (error) {
        console.error("Error loading LPs:", error);
      }
    };

    fetchLPs();
    fetchCloses();
  }, []);

  const addLP = async () => {
    if (!lpName || !commitment || !joinDate) return;

    const payload = {
      name: lpName,
      commitment: Number(commitment),
      dateOfJoin: joinDate,
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save LP");
      }

      const newLP = {
        id: result.data?._id || crypto.randomUUID(),
        name: result.data?.name || lpName,
        commitment: Number(result.data?.commitment ?? commitment),
        dateOfJoin: result.data?.dateOfJoin || joinDate,
      };

      setLps((prev) => [...prev, newLP]);
      await fetchCloses();

      setLpName("");
      setCommitment("");
      setJoinDate("");
    } catch (error) {
      console.error("Error saving LP:", error);
      alert(error.message || "Unable to save LP");
    }
  };

  const startEditLP = (lp) => {
    setEditingLP(lp.id);

    setLpName(lp.name);
    setCommitment(String(lp.commitment));
    setJoinDate(lp.dateOfJoin);
  };

  const saveLP = () => {
    if (!lpName || !commitment || !joinDate) return;

    setLps((prev) =>
      prev.map((lp) =>
        lp.id === editingLP
          ? {
              ...lp,
              name: lpName,
              commitment: Number(commitment),
              dateOfJoin: joinDate,
            }
          : lp,
      ),
    );

    setEditingLP(null);
    setLpName("");
    setCommitment("");
    setJoinDate("");
  };

  const deleteLP = (id) => {
    setLps((prev) => prev.filter((lp) => lp.id !== id));
  };

  const totalCommitment = lps.reduce((sum, lp) => sum + lp.commitment, 0);

  const totalCall = calculatedLPs.reduce((sum, lp) => sum + lp.capitalCall, 0);

  const toggleCompanyStatus = (companyId) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === companyId
          ? { ...company, isActive: !company.isActive }
          : company,
      ),
    );
  };

  const addCompany = () => {
    if (!companyName || !requirement) return;

    const newCompany = {
      id: crypto.randomUUID(),
      name: companyName,
      requirement: Number(requirement),
      profit: 0,
      sector: "Other",
      isActive: true,
    };

    setCompanies((prev) => [...prev, newCompany]);

    setCompanyName("");
    setRequirement("");
  };

  return (
    <div
      className="min-h-screen flex bg-[#f7f3ec] text-[#172d27]"
      style={{ fontFamily: "Georgia, serif" }}
    >
      {/* SIDEBAR */}
      {/* <aside
        className="w-[246px] min-h-screen bg-[#193f34] text-[#f8f4eb] 
        flex flex-col shrink-0 max-md:w-[75px]"
      >
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
            <div
              key={label}
              className={`flex items-center gap-5 px-5 py-4 rounded-xl cursor-pointer
              ${index === 0 ? "bg-[#f6f0e6] text-[#193f34]" : "hover:bg-[#31574c]"}`}
            >
              <Icon size={24} />
              <span className="max-md:hidden">{label}</span>
            </div>
          ))}
        </nav>

        <div className="mt-auto opacity-30 pb-5">
          <Sprout size={150} strokeWidth={1} />
        </div>
      </aside> */}

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
          <SummaryCard
            icon={<Users size={52} fill="#193f34" />}
            value={lps.length}
            label="Total Limited Partners"
          />

          <SummaryCard
            icon={<Database size={52} fill="#193f34" />}
            value={`₹ ${totalCommitment}`}
            label="Total Commitment"
          />

          <SummaryCard
            icon={<TrendingUp size={52} />}
            value={`₹ ${totalCall}`}
            label="Total Capital Call"
          />

          <SummaryCard
            icon={<Handshake size={52} fill="#193f34" />}
            value={activeCompanies.length}
            label="Total Active Companies"
          />
        </section>

        {/* DASHBOARD BODY */}
        <div
          className="grid grid-cols-[minmax(350px,0.75fr)_minmax(0,1.4fr)] gap-4 
          max-xl:grid-cols-1"
        >
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

              <button
                onClick={editingLP ? saveLP : addLP}
                className="green-button"
              >
                {editingLP ? "Save Changes" : "Add"}
              </button>
            </div>

            <hr className="my-7 border-[#ded5c8]" />

            {/* ADD COMPANY */}
            <h3 className="font-semibold mb-3 text-lg">Add Company</h3>

            <div className="flex flex-wrap gap-2">
              <input
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input-style min-w-0 flex-1"
              />

              <input
                type="number"
                placeholder="requirement requirement"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                className="input-style min-w-0 flex-1"
              />

              <button onClick={addCompany} className="green-button">
                Add
              </button>
            </div>

            {/* DECORATIVE CHART */}
            <div className="mt-12 h-28 flex items-end justify-center gap-5 relative">
              {[20, 30, 40, 50, 65, 80, 100].map((height, i) => (
                <div
                  key={i}
                  style={{ height: `${height}%` }}
                  className="w-5 bg-[#547767] rounded-t-sm opacity-80"
                />
              ))}
              <TrendingUp
                className="absolute -top-2 right-10 text-[#819783]"
                size={35}
              />
            </div>
          </section>

          {/* RIGHT SIDE TABLES */}
          <section className="space-y-4 min-w-0">
            {/* CLOSING MANAGEMENT */}
            <div className="border border-[#e2d9cc] rounded-2xl p-5 bg-[#faf7f1]">
              <h2 className="text-2xl font-bold mb-5">Fund Closings</h2>

              {nextClose && (
                <>
                  <p className="font-semibold">Next Close: {nextClose.date}</p>

                  <p className="text-sm mt-2">
                    Previous Close: {nextClose.previousDate}
                  </p>

                  <p className="text-sm mt-2">
                    Days Between Closes: {nextClose.days}
                  </p>

                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">New LPs</h3>

                    {nextClose.lps.map((lp) => (
                      <div
                        key={lp.id}
                        className="flex justify-between border-b py-2"
                      >
                        <span>{lp.name}</span>
                        <span>
                          ₹{" "}
                          {Math.round(
                            (lp.capitalCall * 0.1 * nextClose.days) / 365,
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 font-semibold">
                    Total Equalization: ₹
                    {nextClose.totalEqualization.toLocaleString("en-IN")}
                  </div>
                </>
              )}
              <button
                onClick={mergeClose}
                disabled={!nextClose}
                className="bg-green-700 text-white rounded-lg px-5 py-3 mt-5 w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {nextClose
                  ? `Merge Close ${nextClose.date}`
                  : "No Pending Closes"}
              </button>

              {!nextClose && (
                <p className="text-sm text-gray-600 mt-3">
                  No pending close found. Add an LP with a new closing date.
                </p>
              )}

              {lastMergedClose && (
                <div className="mt-5 rounded-xl border border-[#d8ead4] bg-[#edf8ee] p-4">
                  <h3 className="text-lg font-bold mb-2">Last Merge Summary</h3>
                  <p className="text-sm">
                    Merged close: {lastMergedClose.date}
                  </p>
                  <p className="text-sm mt-1">
                    Previous close: {lastMergedClose.previousDate}
                  </p>
                  <p className="font-semibold mt-2">
                    Total equalization: ₹
                    {lastMergedClose.totalEqualization.toLocaleString("en-IN")}
                  </p>

                  <div className="mt-3 space-y-2">
                    {lastMergedClose.lps.map((lp) => (
                      <div
                        key={lp.id}
                        className="flex justify-between border-b border-[#dfeadf] pb-1 text-sm"
                      >
                        <span>{lp.name}</span>
                        <span>₹ {lp.equalization.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* <div className="mt-4 border border-[#e2d9cc] rounded-2xl p-4 bg-[#faf7f1]">
              <h3 className="text-xl font-bold mb-3">Create Close for LPs</h3>

              <div className="flex gap-2">
                <input
                  type="date"
                  value={newCloseDate}
                  onChange={(e) => setNewCloseDate(e.target.value)}
                  className="input-style flex-1 min-w-0"
                />

                <button onClick={createClose} className="green-button">
                  Create New Close
                </button>
              </div>
            </div> */}

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
                      <th className="table-heading">Ownership</th>
                      <th className="table-heading">Capital Call</th>
                      <th className="table-heading">Commitment Left</th>
                      <th className="table-heading">Date of Join</th>
                      <th className="table-heading">Equalization Amount</th>
                      <th className="table-heading">Profit Distribution</th>
                      <th className="table-heading">Close</th>
                      <th className="table-heading m-auto ">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {calculatedLPs.map((lp) => (
                      <tr
                        key={lp.id}
                        className="border-b hover:bg-[#e8e0d4] border-[#e2d9cc]"
                      >
                        <td className="table-cell">{lp.name}</td>

                        <td className="table-cell">₹ {lp.commitment}</td>

                        <td className="table-cell">
                          {lp.ownership.toFixed(2)}%
                        </td>

                        <td className="table-cell">
                          ₹ {lp.capitalCall.toFixed(2)}
                        </td>

                        <td className="table-cell">
                          ₹ {lp.commitmentLeft.toFixed(2)}
                        </td>

                        <td className="table-cell">{lp.dateOfJoin}</td>

                        <td className="px-4 py-3">
                          ₹{" "}
                          {Math.round(lp.equalization || 0).toLocaleString(
                            "en-IN",
                          )}
                        </td>

                        <td className="table-cell">
                          ₹ {lp.profitDistribution.toFixed(2)}
                        </td>
                        <td className="table-cell">Close {lp.closeNumber}</td>

                        <td className="table-cell">
                          <button
                            className="bg-blue-200 rounded p-2 m-2 "
                            onClick={() => startEditLP(lp)}
                          >
                            Edit
                          </button>

                          <button
                            className="bg-red-200 rounded p-2 m-2 "
                            onClick={() => deleteLP(lp.id)}
                          >
                            Delete
                          </button>
                        </td>
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
                      <th className="table-heading">Requirement Amount</th>
                      <th className="table-heading">Sector</th>
                      <th className="table-heading">Status</th>

                      <th className="table-heading">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {activeCompanies.map((company) => (
                      <tr
                        key={company.id}
                        className="border-b hover:bg-[#e8e0d4] border-[#e2d9cc]"
                      >
                        <td className="table-cell">{company.name}</td>
                        <td className="table-cell">₹ {company.requirement}</td>
                        <td className="table-cell">{company.sector}</td>

                        <td className="table-cell">
                          <span
                            className={`rounded-full px-3 py-1 text-sm ${
                              company.isActive
                                ? "bg-[#d8ead4] text-[#315b3b]"
                                : "bg-[#efe3dc] text-[#6b4a3a]"
                            }`}
                          >
                            {company.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="table-cell">
                          <button
                            className={`rounded p-2 ${
                              company.isActive
                                ? "bg-[#efe3dc] text-[#6b4a3a]"
                                : "bg-[#d8ead4] text-[#315b3b]"
                            }`}
                            onClick={() => toggleCompanyStatus(company.id)}
                          >
                            {company.isActive ? "Set Inactive" : "Set Active"}
                          </button>
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
    <div
      className="bg-[#f1ebe2] hover:bg-[#e8e0d4] border border-[#e3d9cc] rounded-2xl p-6
      flex items-center gap-6 min-h-[124px]"
    >
      <div className="text-[#193f34] shrink-0">{icon}</div>
      <div>
        <h2 className="text-3xl font-bold">{value}</h2>
        <p className="mt-2 text-base whitespace-nowrap">{label}</p>
      </div>
    </div>
  );
}
