import { useState } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useApp();

  // role comes from URL
  const search = new URLSearchParams(window.location.search);
  const role = search.get("role") || "resident";

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const { user, profile } = await res.json();
      login(user, profile);

      alert("Login success!");

      // redirect based on role
      if (user.role === "resident") setLocation("/resident");
      if (user.role === "collector") setLocation("/collector");
      if (user.role === "authority") setLocation("/authority");
    } catch (err) {
      alert("Invalid phone or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleLogin}
        className="bg-white/20 backdrop-blur-xl p-10 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-8 text-center">
          {role.toUpperCase()} LOGIN
        </h2>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-white/60"
            placeholder="Enter phone number"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-white/60"
            placeholder="Enter password"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white p-3 rounded-lg font-semibold hover:bg-primary/90 transition"
        >
          Login
        </button>

        <p
          onClick={() => setLocation(`/register/${role}`)}
          className="text-center mt-6 text-sm underline cursor-pointer"
        >
          New user? Register here
        </p>
      </form>
    </div>
  );
}
