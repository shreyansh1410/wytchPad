"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "../../config";
import axios from "axios";

export default function SigninPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/signin`, form);
      const data = res.data;
      localStorage.setItem("token", data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      router.push("/room");
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.response?.data?.msg || err.message || "Sign in failed");
      localStorage.removeItem("token");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#121212",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#181a1b",
          padding: 32,
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
          minWidth: 340,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <h2
          style={{
            color: "#fff",
            fontWeight: 700,
            marginBottom: 12,
            fontSize: 28,
            textAlign: "center",
          }}
        >
          Sign In
        </h2>
        <label style={{ color: "#cfd8dc", fontWeight: 500, marginBottom: 4 }}>
          Email
          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            type="email"
            style={inputStyle}
          />
        </label>
        <label style={{ color: "#cfd8dc", fontWeight: 500, marginBottom: 4 }}>
          Password
          <input
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            type="password"
            minLength={6}
            style={inputStyle}
          />
        </label>
        <button
          type="submit"
          style={{
            background: "#fff",
            color: "#000",
            border: "none",
            borderRadius: 8,
            padding: "0.75rem 0",
            fontWeight: 700,
            fontSize: 18,
            marginTop: 6,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "background 0.2s",
          }}
        >
          Sign In
        </button>
        {error && (
          <div style={{ color: "#e57373", marginTop: 8, textAlign: "center" }}>
            {error}
          </div>
        )}
        <div style={{ color: "#b0bec5", marginTop: 16, textAlign: "center" }}>
          Don't have an account?{" "}
          <a
            href="/auth/signup"
            style={{ color: "#fff", textDecoration: "underline" }}
          >
            Sign Up
          </a>
        </div>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 1rem",
  marginTop: 6,
  borderRadius: 8,
  border: "1px solid #222b3a",
  background: "#23272a",
  color: "#fff",
  fontSize: 16,
  outline: "none",
  marginBottom: 8,
  boxSizing: "border-box",
};
