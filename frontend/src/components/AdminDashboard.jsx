import { useEffect, useState } from "react";

export default function AdminDashboard({ token, user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load users");
      }

      setUsers(result.users || []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const updateStatus = async (targetUserId, nextStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${targetUserId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Status update failed");
      }

      await fetchUsers();
    } catch (err) {
      setError(err.message || "Unable to update user status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f3ec] text-[#193f34]">
        Loading admin panel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ec] p-6 text-[#172d27]">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-[#e2d9cc] bg-[#faf7f1] p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#8f7a52]">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#193f34]">
              User Management
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-[#ddd3c5] bg-[#f1ebe2] px-4 py-2 text-sm font-medium">
              {user?.name || "Administrator"}
            </div>
            <button
              onClick={onLogout}
              className="rounded-full bg-[#193f34] px-4 py-2 text-sm font-semibold text-white"
            >
              Logout
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-[2rem] border border-[#e2d9cc] bg-[#faf7f1] shadow-sm">
          <table className="min-w-full text-left">
            <thead className="bg-[#193f34] text-white">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Status</th>
                <th className="p-4">Role</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((row) => (
                <tr key={row._id} className="border-t border-[#e2d9cc]">
                  <td className="p-4 font-medium">{row.name}</td>
                  <td className="p-4">{row.email}</td>
                  <td className="p-4">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                        row.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : row.status === "blocked"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="p-4 capitalize">{row.role}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {row.status !== "approved" && (
                        <button
                          onClick={() => updateStatus(row._id, "approved")}
                          className="rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white"
                        >
                          Approve
                        </button>
                      )}
                      {row.status !== "blocked" && (
                        <button
                          onClick={() => updateStatus(row._id, "blocked")}
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white"
                        >
                          Block
                        </button>
                      )}
                      {row.status === "blocked" && (
                        <button
                          onClick={() => updateStatus(row._id, "approved")}
                          className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white"
                        >
                          Unblock
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
