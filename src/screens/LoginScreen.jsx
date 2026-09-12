import { useState } from "react";
import "./LoginScreen.css";
import GeoPlayButton from "../components/GeoPlayButton";

function LoginScreen({ onSignUp, onMapShortcut, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(event) {
    event.preventDefault();

    // Demo behavior: fields may be empty; Login goes directly to Home.
    onLogin();
  }

  return (
    <main className="login-screen">
      {/* Background atmosphere */}
      <div className="login-bg-wisp login-bg-wisp-one"></div>
      <div className="login-bg-wisp login-bg-wisp-two"></div>

      <div className="login-bg-glow login-bg-glow-left"></div>
      <div className="login-bg-glow login-bg-glow-right"></div>

      <div className="login-bg-speck login-bg-speck-one"></div>
      <div className="login-bg-speck login-bg-speck-two"></div>
      <div className="login-bg-speck login-bg-speck-three"></div>

      <section className="login-card">
        {/* Map shortcut for testing */}
        <button
          type="button"
          className="login-map-shortcut"
          onClick={onMapShortcut}
          aria-label="Open map"
          title="Open map"
        >
          <span aria-hidden="true">⌖</span>
        </button>
        <div className="login-brand">
          <div className="login-logo">
            <img src="/geoplay-logo.png" alt="GeoPlay" />
          </div>

          <p className="login-tagline">
            Your bet starts here.
          </p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>

          <GeoPlayButton type="submit">
            LOG IN
          </GeoPlayButton>
        </form>

        <button
          className="forgot-button"
          type="button"
          onClick={() => console.log("Forgot password")}
        >
          Forgot password?
        </button>

        <div className="signup-row">
          <span>Don't have an account?</span>

          <button
            className="signup-button"
            type="button"
            onClick={onSignUp}
          >
            Sign up
          </button>
        </div>
      </section>
    </main>
  );
}

export default LoginScreen;