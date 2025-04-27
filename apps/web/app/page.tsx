import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div>
      <Header />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#121212",
          color: "#fff",
        }}
      >
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          <h1 style={{ fontSize: "2.2rem", fontWeight: 600, marginBottom: 8 }}>
            Welcome to <span style={{ color: "#64b5f6" }}>WytchPad</span>
          </h1>
          <p
            style={{
              maxWidth: 480,
              textAlign: "center",
              fontSize: "1.15rem",
              color: "#cfd8dc",
            }}
          >
            The collaborative chat and room platform for you and your friends.
            Sign up to create your own rooms and chat in real-time!
          </p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link
              href="/signup"
              style={{
                background: "#fff",
                color: "#000",
                padding: "0.75rem 2rem",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: "1.1rem",
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(100,181,246,0.15)",
                transition: "background 0.2s",
              }}
            >
              Sign Up
            </Link>
            <Link
              href="/signin"
              style={{
                background: "#222",
                color: "#fff",
                padding: "0.75rem 2rem",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: "1.1rem",
                textDecoration: "none",
                border: "1px solid #64b5f6",
                boxShadow: "0 2px 8px rgba(33,33,33,0.08)",
                transition: "background 0.2s",
              }}
            >
              Sign In
            </Link>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
