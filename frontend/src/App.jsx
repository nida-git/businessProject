import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  Landmark,
  Database,
  TrendingUp,
  Handshake,
  UserRound,
  LogOut,
} from "lucide-react";
import { calculateLPs, getNextClose } from "./utils/fundCalculations";
import AuthPage from "./components/AuthPage";
import LandingPage from "./components/LandingPage";
import AdminDashboard from "./components/AdminDashboard";

const API_BASE_URL = "http://localhost:5000";
const API_URL = `${API_BASE_URL}/api/lps`;
const COMPANY_API_URL = `${API_BASE_URL}/api/companies`;

const getStoredToken = () => localStorage.getItem("peFundToken");

export default function App() {
  const [token, setToken] = useState(getStoredToken);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(getStoredToken()));
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setAuthLoading(false);
      setUser(null);
      return;
    }

    const restoreSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(token);

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Session expired");
        }

        setUser(result.user);
      } catch (error) {
        console.error("Session restore failed:", error);
        localStorage.removeItem("peFundToken");
        // setToken(null);
        setUser(null);
        navigate("/login");
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, [token, navigate]);

  const handleAuthSuccess = (newToken, userData) => {
    localStorage.setItem("peFundToken", newToken);
    setToken(newToken);
    setUser(userData);
    navigate(userData.role === "admin" ? "/admin" : "/dashboard");
    console.log(newToken);
  };

  const handleLogout = async () => {
    const currentToken = localStorage.getItem("peFundToken");

    if (currentToken) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });
      } catch (error) {
        console.error("Logout sync failed:", error);
      }
    }

    localStorage.removeItem("peFundToken");
    setToken(null);
    setUser(null);
    navigate("/");
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f3ec] text-[#193f34]">
        <div className="text-xl font-semibold">Loading fund workspace...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          token ? (
            <Navigate
              to={user?.role === "admin" ? "/admin" : "/dashboard"}
              replace
            />
          ) : (
            <AuthPage mode="login" onAuthSuccess={handleAuthSuccess} />
          )
        }
      />
      <Route
        path="/register"
        element={
          token ? (
            <Navigate
              to={user?.role === "admin" ? "/admin" : "/dashboard"}
              replace
            />
          ) : (
            <AuthPage mode="register" onAuthSuccess={handleAuthSuccess} />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          token && user?.status === "approved" ? (
            <Dashboard user={user} token={token} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/admin"
        element={
          token && user?.role === "admin" ? (
            <AdminDashboard token={token} user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to={token ? "/dashboard" : "/login"} replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function Dashboard({ token, user, onLogout }) {
  const [fundName, setFundName] = useState("Private Equity Fund");
  const [editingLP, setEditingLP] = useState(null);
  const [lps, setLps] = useState([]);
  const [mergedCloseDates, setMergedCloseDates] = useState([]);
  const [lastMergedClose, setLastMergedClose] = useState(null);
  const [lpName, setLpName] = useState("");
  const [commitment, setCommitment] = useState("");
  const [joinDate, setJoinDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [companies, setCompanies] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [requirement, setRequirement] = useState("");

  const activeCompanies = useMemo(
    () => companies.filter((company) => company.isActive !== false),
    [companies],
  );

  const calculatedLPs = useMemo(
    () => calculateLPs(lps, activeCompanies, mergedCloseDates),
    [lps, activeCompanies, mergedCloseDates],
  );

  const nextClose = useMemo(
    () => getNextClose(lps, activeCompanies, mergedCloseDates),
    [lps, activeCompanies, mergedCloseDates],
  );

  const apiFetch = async (url, options = {}) => {
    const headers = {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    return fetch(url, { ...options, headers });
  };

  const fetchCloses = async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/closes`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load closes");
      }

      setMergedCloseDates(result.mergedDates || result.data?.mergedDates || []);
    } catch (error) {
      console.error("Error loading closes:", error);
    }
  };

  const fetchLPs = async () => {
    try {
      const response = await apiFetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch LPs");
      }

      const data = await response.json();
      const mappedLps = data.map((lp) => ({
        ...lp,
        id: lp._id || lp.id,
        name: lp.name,
        commitment: Number(lp.commitment),
        dateOfJoin: lp.dateOfJoin,
      }));

      setLps(mappedLps);
    } catch (error) {
      console.error("Error loading LPs:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await apiFetch(COMPANY_API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch companies");
      }

      const data = await response.json();
      setCompanies(
        data.map((company) => ({
          ...company,
          id: company._id || company.id,
          isActive: company.isActive !== false,
        })),
      );
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const fetchDashboardData = async () => {
    await fetchLPs();
    await fetchCloses();
    await fetchCompanies();
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const mergeClose = async () => {
    if (!nextClose) {
      alert("No pending close available.");
      return;
    }

    const confirmed = window.confirm(`Merge close dated ${nextClose.date}?`);
    if (!confirmed) return;

    try {
      const response = await apiFetch(`${API_BASE_URL}/api/closes/merge`, {
        method: "POST",
        body: JSON.stringify({ date: nextClose.date }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Merge failed");
      }

      const serverDates = result.mergedDates || result.data?.mergedDates || [];
      const updatedDates = serverDates.map((item) =>
        typeof item === "string" ? item : item.date,
      );

      setMergedCloseDates([...new Set([...updatedDates, nextClose.date])]);
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

  const addLP = async () => {
    if (!lpName || !commitment || !joinDate) return;

    const payload = {
      name: lpName,
      commitment: Number(commitment),
      dateOfJoin: joinDate,
    };

    try {
      const response = await apiFetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save LP");
      }

      setLps((prev) => [
        ...prev,
        {
          id: result.data?._id || result.data?.id || crypto.randomUUID(),
          name: result.data?.name || lpName,
          commitment: Number(result.data?.commitment ?? commitment),
          dateOfJoin: result.data?.dateOfJoin || joinDate,
        },
      ]);

      setLpName("");
      setCommitment("");
      setJoinDate(new Date().toISOString().slice(0, 10));
      await fetchDashboardData();
    } catch (error) {
      console.error("Error saving LP:", error);
      alert(error.message || "Unable to save LP");
    }
  };

  const startEditLP = (lp) => {
    setEditingLP(lp);
    setLpName(lp.name);
    setCommitment(String(lp.commitment));
    setJoinDate(lp.dateOfJoin);
  };

  const saveLP = async () => {
    if (!editingLP) return;

    try {
      const id = editingLP.id || editingLP._id;
      const response = await apiFetch(`${API_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: lpName,
          commitment: Number(commitment),
          dateOfJoin: joinDate,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update LP");
      }

      const updatedLp = {
        ...result,
        id: result._id || id,
        name: result.name || lpName,
        commitment: Number(result.commitment ?? commitment),
        dateOfJoin: result.dateOfJoin || joinDate,
      };

      setLps((prev) =>
        prev.map((lp) => (lp.id === id || lp._id === id ? updatedLp : lp)),
      );
      setEditingLP(null);
      setLpName("");
      setCommitment("");
      setJoinDate(new Date().toISOString().slice(0, 10));
      await fetchDashboardData();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const deleteLP = async (id) => {
    try {
      const response = await apiFetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete LP");
      }

      setLps((prev) => prev.filter((lp) => (lp.id || lp._id) !== id));
      await fetchDashboardData();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const totalCommitment = lps.reduce(
    (sum, lp) => sum + Number(lp.commitment || 0),
    0,
  );
  const totalCall = calculatedLPs.reduce(
    (sum, lp) => sum + Number(lp.capitalCall || 0),
    0,
  );

  const toggleCompanyStatus = async (companyId) => {
    const targetCompany = companies.find(
      (company) => company.id === companyId || company._id === companyId,
    );

    if (!targetCompany) {
      return;
    }

    try {
      const response = await apiFetch(`${COMPANY_API_URL}/${companyId}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !targetCompany.isActive }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update company status");
      }

      setCompanies((prev) =>
        prev.map((company) =>
          company.id === companyId || company._id === companyId
            ? { ...company, isActive: !company.isActive }
            : company,
        ),
      );
    } catch (error) {
      console.error("Error updating company status:", error);
      alert(error.message);
    }
  };

  const addCompany = async () => {
    if (!companyName || !requirement) return;

    const newCompany = {
      name: companyName,
      requirement: Number(requirement),
      profit: 0,
      sector: "Other",
      isActive: true,
    };

    try {
      const response = await apiFetch(COMPANY_API_URL, {
        method: "POST",
        body: JSON.stringify(newCompany),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save company");
      }

      const createdCompany = {
        ...result.company,
        id: result.company?._id || result.company?.id,
      };

      setCompanies((prev) => [...prev, createdCompany]);
      setCompanyName("");
      setRequirement("");
    } catch (error) {
      console.error("Error adding company:", error);
      alert(error.message || "Unable to add company");
    }
  };

  return (
    <div
      className="min-h-screen flex bg-[#f7f3ec] text-[#172d27]"
      style={{ fontFamily: "Georgia, serif" }}
    >
      <main className="flex-1 min-w-0 p-9 max-md:p-4">
        <header className="flex justify-between items-start mb-9 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-[#193f34] max-md:text-2xl">
              {fundName}
            </h1>
            <p className="text-xl mt-2">Track · Manage · Grow</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="border border-[#ddd3c5] rounded-2xl px-5 py-3 flex gap-3 items-center bg-[#f1ebe2]">
              <UserRound size={20} /> {user?.name || "GP"}
            </button>
            <button
              onClick={onLogout}
              className="border border-[#ddd3c5] rounded-2xl px-4 py-3 flex gap-2 items-center bg-white"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </header>

        <section className="grid grid-cols-4 gap-5 mb-9 max-xl:grid-cols-2 max-sm:grid-cols-1">
          <SummaryCard
            icon={<Users size={52} fill="#193f34" />}
            value={lps.length}
            label="Total Limited Partners"
          />
          <SummaryCard
            icon={<Database size={52} fill="#193f34" />}
            value={`₹ ${Number(totalCommitment).toLocaleString("en-IN")}`}
            label="Total Commitment"
          />
          <SummaryCard
            icon={<TrendingUp size={52} />}
            value={`₹ ${Number(totalCall).toLocaleString("en-IN")}`}
            label="Total Capital Call"
          />
          <SummaryCard
            icon={<Handshake size={52} fill="#193f34" />}
            value={activeCompanies.length}
            label="Total Active Companies"
          />
        </section>

        <div className="grid grid-cols-[minmax(350px,0.75fr)_minmax(0,1.4fr)] gap-4 max-xl:grid-cols-1">
          <section className="border border-[#e2d9cc] rounded-2xl p-5 bg-[#faf7f1]">
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
                placeholder="Requirement"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                className="input-style min-w-0 flex-1"
              />
              <button onClick={addCompany} className="green-button">
                Add
              </button>
            </div>

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

          <section className="space-y-4 min-w-0">
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
                    Total Equalization: ₹{" "}
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
                    Total equalization: ₹{" "}
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
                      <th className="table-heading">Actions</th>
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
                        <td className="table-cell">
                          ₹{" "}
                          {Math.abs(lp.equalization) < 0.005
                            ? "0.00"
                            : lp.equalization.toFixed(2)}
                        </td>
                        <td className="table-cell">
                          ₹ {lp.profitDistribution.toFixed(2)}
                        </td>
                        <td className="table-cell">Close {lp.closeNumber}</td>
                        <td className="table-cell">
                          <button
                            className="bg-blue-200 rounded p-2 m-2"
                            onClick={() => startEditLP(lp)}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-200 rounded p-2 m-2"
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
    <div className="bg-[#f1ebe2] hover:bg-[#e8e0d4] border border-[#e3d9cc] rounded-2xl p-6 flex items-center gap-6 min-h-[124px]">
      <div className="text-[#193f34] shrink-0">{icon}</div>
      <div>
        <h2 className="text-3xl font-bold">{value}</h2>
        <p className="mt-2 text-base whitespace-nowrap">{label}</p>
      </div>
    </div>
  );
}
