import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "../app/config";
import Link from "next/link";
import { Input } from "@repo/ui/index";
import { Button } from "@repo/ui/index";

interface AuthPageProps {
  mode: "signin" | "signup";
}

export default function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter();
  const [form, setForm] = useState(
    mode === "signup"
      ? { email: "", password: "", firstName: "", lastName: "" }
      : { email: "", password: "" }
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signin") {
        const res = await fetch(`${BACKEND_URL}/auth/signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Sign in failed");
        localStorage.setItem("token", data.token);
        router.push("/room");
      } else {
        const res = await fetch(`${BACKEND_URL}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Signup failed");
        router.push("/auth/signin");
      }
    } catch (err: any) {
      setError(err.message);
      if (mode === "signin") localStorage.removeItem("token");
    } finally {
      setLoading(false);
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
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </h2>
        {mode === "signup" && (
          <>
            <Input
              label="First Name"
              type="text"
              name="firstName"
              id="firstName"
              value={(form as any).firstName}
              onChange={handleChange}
              required
              autoComplete="given-name"
            />
            <Input
              label="Last Name"
              type="text"
              name="lastName"
              id="lastName"
              value={(form as any).lastName}
              onChange={handleChange}
              required
              autoComplete="family-name"
            />
          </>
        )}
        <Input
          label="Email"
          type="email"
          name="email"
          id="email"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          name="password"
          id="password"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
        />
        {error && (
          <div
            style={{
              color: "#ff5252",
              background: "#2d2323",
              padding: "8px 12px",
              borderRadius: 8,
              marginTop: 4,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}
        <Button loading={loading}>
          {loading
            ? mode === "signin"
              ? "Signing In..."
              : "Signing Up..."
            : mode === "signin"
              ? "Sign In"
              : "Sign Up"}
        </Button>
        <div
          style={{
            display: "block",
            marginTop: 8,
            color: "#b0bec5",
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          {mode === "signup"
            ? `Already have an account? `
            : `Don't have an account? `}
          <Link
            href={mode === "signup" ? "/auth/signin" : "/auth/signup"}
            style={{
              textDecoration: "underline",
            }}
          >
            {mode === "signup" ? "Sign In" : "Sign Up"}
          </Link>
        </div>
      </form>
    </div>
  );
}
