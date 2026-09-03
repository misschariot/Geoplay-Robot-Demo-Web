import { useState } from "react";
import "./SignUpScreen.css";

function SignUpScreen() {
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

  function handleSignUp(event) {
    event.preventDefault();

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
  }

  return (
    <main className="signup-screen">
      <section className="signup-card">
        <div className="signup-brand">
          <div className="signup-logo">
            <img src="/geoplay-logo.png" alt="GeoPlay" />
          </div>

          <p className="signup-tagline">
            Create your Geoplay account.
          </p>
        </div>

        <form className="signup-form" onSubmit={handleSignUp}>
          <div className="signup-name-row">
            <div className="input-group">
              <label htmlFor="firstName">First Name</label>

              <input
                id="firstName"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="lastName">Last Name</label>

              <input
                id="lastName"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                autoComplete="family-name"
                required
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
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>

            <input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
              autoComplete="bday"
              required
            />

            <p className="field-note">
              You must meet the minimum age requirement applicable to your
              location to participate in gaming.
            </p>
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
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="signup-legal">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(event) => setAgreeToTerms(event.target.checked)}
                required
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
                onChange={(event) =>
                  setAcknowledgePrivacy(event.target.checked)
                }
                required
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
                onChange={(event) =>
                  setAcknowledgeResponsibleGaming(event.target.checked)
                }
                required
              />

              <span>
                I have read and understand{" "}
                <button type="button">Responsible Gaming</button>.
              </span>
            </label>
          </div>

          <button className="signup-submit-button" type="submit">
            Create Account
          </button>
        </form>

        <div className="login-row">
          <span>Already have an account?</span>

          <button
            className="back-to-login-button"
            type="button"
            onClick={() => console.log("Back to login")}
          >
            Log In
          </button>
        </div>
      </section>
    </main>
  );
}

export default SignUpScreen;