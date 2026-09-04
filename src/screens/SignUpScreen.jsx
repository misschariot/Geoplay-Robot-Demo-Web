import { useState } from "react";
import "./SignUpScreen.css";

function SignUpScreen({ onBackToLogin, onVerifyEmail }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [acknowledgePrivacy, setAcknowledgePrivacy] = useState(false);
  const [acknowledgeResponsibleGaming, setAcknowledgeResponsibleGaming] =
    useState(false);

  const [formError, setFormError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [dateError, setDateError] = useState("");

  function handleFillTestInformation() {
    setFirstName("Test");
    setLastName("User");
    setEmail("test@geoplay.com");
    setDateOfBirth("1990-01-15");
    setPhone("555-555-5555");
    setPassword("GeoPlay123!");
    setConfirmPassword("GeoPlay123!");

    setAgreeToTerms(true);
    setAcknowledgePrivacy(true);
    setAcknowledgeResponsibleGaming(true);

    setFormError("");
    setPasswordError("");
    setDateError("");

    console.log("Test sign-up information filled.");
  }

  function handlePasswordChange(event) {
    const value = event.target.value;

    setPassword(value);
    setFormError("");

    if (confirmPassword && value !== confirmPassword) {
      setPasswordError("Passwords do not match.");
    } else {
      setPasswordError("");
    }
  }

  function handleConfirmPasswordChange(event) {
    const value = event.target.value;

    setConfirmPassword(value);
    setFormError("");

    if (password && value !== password) {
      setPasswordError("Passwords do not match.");
    } else {
      setPasswordError("");
    }
  }

  function handleDateChange(event) {
    const value = event.target.value;

    setDateOfBirth(value);
    setFormError("");

    if (!value) {
      setDateError("Please enter your date of birth.");
    } else {
      setDateError("");
    }
  }

  function handleCreateAccount() {
    console.log("Create Account clicked!");

    setFormError("");

    if (!firstName.trim()) {
      setFormError("Please enter your first name.");
      return;
    }

    if (!lastName.trim()) {
      setFormError("Please enter your last name.");
      return;
    }

    if (!email.trim()) {
      setFormError("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (!dateOfBirth) {
      setDateError("Please enter your date of birth.");
      return;
    }

    setDateError("");

    if (!password) {
      setFormError("Please create a password.");
      return;
    }

    if (!confirmPassword) {
      setFormError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordError("");

    if (!agreeToTerms) {
      setFormError("Please agree to the Terms of Service.");
      return;
    }

    if (!acknowledgePrivacy) {
      setFormError("Please acknowledge the Privacy Policy.");
      return;
    }

    if (!acknowledgeResponsibleGaming) {
      setFormError("Please acknowledge the Responsible Gaming information.");
      return;
    }

    console.log("Sign up submitted:", {
      firstName,
      lastName,
      email,
      dateOfBirth,
      phone,
      password,
      confirmPassword,
      agreeToTerms,
      acknowledgePrivacy,
      acknowledgeResponsibleGaming,
    });

    console.log("Navigating to Verify Email with:", email);

    if (onVerifyEmail) {
      onVerifyEmail(email);
    } else {
      console.error("onVerifyEmail callback is missing!");

      setFormError(
        "Something went wrong. Please try again."
      );
    }
  }

  return (
    <main className="signup-screen">
      {/* Background atmosphere */}
      <div className="signup-bg-wisp signup-bg-wisp-one"></div>
      <div className="signup-bg-wisp signup-bg-wisp-two"></div>

      <div className="signup-bg-glow signup-bg-glow-left"></div>
      <div className="signup-bg-glow signup-bg-glow-right"></div>

      {/* Floating atmosphere particles */}
      <div className="signup-bg-speck signup-bg-speck-one"></div>
      <div className="signup-bg-speck signup-bg-speck-two"></div>
      <div className="signup-bg-speck signup-bg-speck-three"></div>
      <div className="signup-bg-speck signup-bg-speck-four"></div>
      <div className="signup-bg-speck signup-bg-speck-five"></div>
      <div className="signup-bg-speck signup-bg-speck-six"></div>
      <div className="signup-bg-speck signup-bg-speck-seven"></div>
      <div className="signup-bg-speck signup-bg-speck-eight"></div>
      <div className="signup-bg-speck signup-bg-speck-nine"></div>

      <section className="signup-card">
        {/* Test information button */}
        <button
          type="button"
          onClick={handleFillTestInformation}
          aria-label="Fill test information"
          title="Fill test information"
          style={{
            position: "absolute",
            top: "14px",
            right: "16px",
            width: "30px",
            height: "30px",
            padding: "0",
            border: "1px solid rgba(255, 138, 53, 0.25)",
            borderRadius: "50%",
            background: "rgba(255, 138, 53, 0.06)",
            color: "#ff9a45",
            fontFamily: "inherit",
            fontSize: "15px",
            lineHeight: "1",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
          }}
        >
          ✎
        </button>

        <div className="signup-brand">
          <div className="signup-logo">
            <img src="/geoplay-logo.png" alt="GeoPlay" />
          </div>

          <p className="signup-tagline">
            Create your Geoplay account.
          </p>
        </div>

        <form
          className="signup-form"
          onSubmit={(event) => event.preventDefault()}
          noValidate
        >
          <div className="signup-name-row">
            <div className="input-group">
              <label htmlFor="firstName">First Name</label>

              <input
                id="firstName"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(event) => {
                  setFirstName(event.target.value);
                  setFormError("");
                }}
                autoComplete="given-name"
              />
            </div>

            <div className="input-group">
              <label htmlFor="lastName">Last Name</label>

              <input
                id="lastName"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(event) => {
                  setLastName(event.target.value);
                  setFormError("");
                }}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="signupEmail">Email</label>

            <input
              id="signupEmail"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFormError("");
              }}
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>

            <input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={handleDateChange}
              autoComplete="bday"
            />

            <p className="field-note">
              You must meet the minimum age requirement applicable to your
              location to participate in gaming.
            </p>

            {dateError && (
              <p
                role="alert"
                style={{
                  margin: "0",
                  color: "#ff8a65",
                  fontSize: "11px",
                  lineHeight: "1.4",
                  textAlign: "left",
                }}
              >
                {dateError}
              </p>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="phone">
              Mobile Phone <span>(Optional)</span>
            </label>

            <input
              id="phone"
              type="tel"
              placeholder="Enter your mobile number"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
            />
          </div>

          <div className="input-group">
            <label htmlFor="signupPassword">Password</label>

            <input
              id="signupPassword"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={handlePasswordChange}
              autoComplete="new-password"
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              autoComplete="new-password"
            />

            {passwordError && (
              <p
                role="alert"
                style={{
                  margin: "0",
                  color: "#ff8a65",
                  fontSize: "11px",
                  lineHeight: "1.4",
                  textAlign: "left",
                }}
              >
                {passwordError}
              </p>
            )}
          </div>

          <div className="signup-legal">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(event) => {
                  setAgreeToTerms(event.target.checked);
                  setFormError("");
                }}
              />

              <span>
                I agree to the{" "}
                <button type="button">Terms of Service</button>.
              </span>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={acknowledgePrivacy}
                onChange={(event) => {
                  setAcknowledgePrivacy(event.target.checked);
                  setFormError("");
                }}
              />

              <span>
                I acknowledge the{" "}
                <button type="button">Privacy Policy</button>.
              </span>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={acknowledgeResponsibleGaming}
                onChange={(event) => {
                  setAcknowledgeResponsibleGaming(event.target.checked);
                  setFormError("");
                }}
              />

              <span>
                I have read and understand{" "}
                <button type="button">Responsible Gaming</button>.
              </span>
            </label>
          </div>

          {formError && (
            <p
              role="alert"
              style={{
                margin: "-4px 0 0",
                color: "#ff8a65",
                fontSize: "12px",
                lineHeight: "1.45",
                textAlign: "center",
              }}
            >
              {formError}
            </p>
          )}

          <button
            className="signup-submit-button"
            type="button"
            onClick={handleCreateAccount}
          >
            Create Account
          </button>
        </form>

        <div className="login-row">
          <span>Already have an account?</span>

          <button
            className="back-to-login-button"
            type="button"
            onClick={onBackToLogin}
          >
            Log In
          </button>
        </div>
      </section>
    </main>
  );
}

export default SignUpScreen;