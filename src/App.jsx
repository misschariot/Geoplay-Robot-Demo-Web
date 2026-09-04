import { useState, useEffect } from "react";
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import VerifyEmailScreen from "./screens/VerifyEmailScreen";
import FTUEWelcomeScreen from "./screens/FTUEWelcomeScreen";
import "./App.css";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState("login");
  const [verificationEmail, setVerificationEmail] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  function goToLogin() {
    setCurrentScreen("login");
  }

  function goToSignUp() {
    setCurrentScreen("signup");
  }

  function goToVerifyEmail(email) {
    console.log("App: navigating to Verify Email");
    console.log("Verification email:", email);

    setVerificationEmail(email);
    setCurrentScreen("verify-email");
  }

  function goToFTUE() {
    console.log("App: navigating to FTUE");

    setCurrentScreen("ftue");
  }

  if (showSplash) {
    return <SplashScreen />;
  }

  if (currentScreen === "ftue") {
    return <FTUEWelcomeScreen />;
  }

  if (currentScreen === "verify-email") {
    return (
      <VerifyEmailScreen
        email={verificationEmail}
        onBack={goToSignUp}
        onContinue={goToFTUE}
      />
    );
  }

  if (currentScreen === "signup") {
    return (
      <SignUpScreen
        onBackToLogin={goToLogin}
        onVerifyEmail={goToVerifyEmail}
      />
    );
  }

  return <LoginScreen onSignUp={goToSignUp} />;
}

export default App;