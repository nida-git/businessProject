import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const AUTH_API_BASE_URL = "http://localhost:5000/api/auth";

export default function AuthPage({ mode, onAuthSuccess }) {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.flash || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNotice(location.state?.flash || "");
  }, [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/login" : "/register";
      const response = await fetch(`${AUTH_API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Authentication failed");
      }

      if (!isLogin) {
        navigate("/login", {
          state: {
            flash:
              "Registration successful. Your account is pending admin approval.",
          },
        });
        return;
      }

      onAuthSuccess(result.token, result.user);
    } catch (submitError) {
      setError(
        submitError.message || "Something went wrong while authenticating.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f3ec] p-6">
      <div className="w-full max-w-md rounded-3xl border border-[#e2d9cc] bg-[#faf7f1] p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-[#193f34]">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-[#516a62]">
            {isLogin
              ? "Sign in to manage your private equity fund."
              : "Register to start tracking LPs, capital calls and closes."}
          </p>
        </div>

        {notice && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {notice}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="mb-1 block text-sm font-medium text-[#193f34]">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-style w-full"
                placeholder="e.g. Alex Morgan"
                required
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-[#193f34]">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-style w-full"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#193f34]">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-style w-full"
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="green-button w-full"
            disabled={loading}
          >
            {loading
              ? isLogin
                ? "Signing in..."
                : "Creating account..."
              : isLogin
                ? "Login"
                : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#516a62]">
          {isLogin ? "Need an account?" : "Already have an account?"}{" "}
          <Link
            to={isLogin ? "/register" : "/login"}
            className="font-semibold text-[#193f34] underline"
          >
            {isLogin ? "Create one" : "Log in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
