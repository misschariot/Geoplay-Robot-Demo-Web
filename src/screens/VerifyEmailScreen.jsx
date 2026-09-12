import { useState } from "react";
import "./VerifyEmailScreen.css";
import GeoPlayButton from "../components/GeoPlayButton";

function VerifyEmailScreen({ email, onBack, onContinue }) {
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  function handleVerify(event) {
    event.preventDefault();

    console.log("Email verification submitted:", {
      email,
      code,
    });

    setIsVerified(true);
  }

  function handleResendCode() {
    console.log("Verification code resent to:", email);
  }

  if (isVerified) {
    return (
      <main className="verify-email-screen">
        <section className="verify-email-card verify-email-card--success">
          <div className="verify-email-brand">
            <div className="verify-email-logo">
              <img src="/geoplay-logo.png" alt="GeoPlay" />
            </div>

            {/* Success state intentionally keeps the logo clean without a tagline. */}
          </div>

          <div className="verify-email-content">
            <div
              className="verify-email-success-divider"
              aria-hidden="true"
            />

            <h1>Account Verified</h1>

            <p className="verify-email-message">
              Your email has been verified.
            </p>

            <p className="verify-email-instructions">
              You're all set.
            </p>

            <GeoPlayButton
              type="button"
              onClick={onContinue}
            >
              CONTINUE
            </GeoPlayButton>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="verify-email-screen">
      <section className="verify-email-card">
        <div className="verify-email-brand">
          <div className="verify-email-logo">
            <img src="/geoplay-logo.png" alt="GeoPlay" />
          </div>

          <p className="verify-email-tagline">
            Almost there.
          </p>
        </div>

        <div className="verify-email-content">
          <div className="verify-email-icon" aria-hidden="true">
            ✉
          </div>

          <h1>Verify your email</h1>

          <p className="verify-email-message">
            We sent a 6-digit code to
          </p>

          <p className="verify-email-address">
            {email || "your email address"}
          </p>

          <form
            className="verify-email-form"
            onSubmit={handleVerify}
          >
            <div className="input-group">
              <label htmlFor="verificationCode">
                Verification Code
              </label>

              <input
                id="verificationCode"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                value={code}
                onChange={(event) => {
                  const value = event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

                  setCode(value);
                }}
                maxLength={6}
                required
              />
            </div>

            <GeoPlayButton
              type="submit"
              disabled={code.length !== 6}
            >
              VERIFY EMAIL
            </GeoPlayButton>
          </form>

          <div className="resend-section">
            <p>Didn't receive it?</p>

            <button
              className="resend-code-button"
              type="button"
              onClick={handleResendCode}
            >
              Resend Code
            </button>
          </div>
        </div>

        <button
          className="change-email-button"
          type="button"
          onClick={onBack}
        >
          ← Change email
        </button>
      </section>
    </main>
  );
}

export default VerifyEmailScreen;