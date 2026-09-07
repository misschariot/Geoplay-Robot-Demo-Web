import { useState, useEffect } from "react";
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import VerifyEmailScreen from "./screens/VerifyEmailScreen";
import FTUEWelcomeScreen from "./screens/FTUEWelcomeScreen";
import HomeScreen from "./screens/HomeScreen";
import GeoPlayMap from "./screens/GeoPlayMap";
import "./App.css";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showMapSplash, setShowMapSplash] = useState(false);
  const [currentScreen, setCurrentScreen] = useState("login");
  const [verificationEmail, setVerificationEmail] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showMapSplash) {
      return;
    }

    const timer = setTimeout(() => {
      setShowMapSplash(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showMapSplash]);

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

  function goToMap() {
    console.log("App: navigating to Map");

    // Mount the map immediately underneath the intentional
    // 5-second splash transition so MapLibre can initialize
    // while the splash is being displayed.
    setCurrentScreen("map");
    setShowMapSplash(true);
  }

  function goToHome() {
    console.log("App: navigating to Home");

    setCurrentScreen("home");
  }

  if (showSplash) {
    return <SplashScreen />;
  }

  if (currentScreen === "map") {
    return (
      <>
        {/* MapLibre initializes underneath the splash, but the FTUE
            sequence does not begin until the splash is gone. */}
        <GeoPlayMap startFtue={!showMapSplash} />

        {showMapSplash && (
          <div className="map-transition-overlay">
            <SplashScreen />
          </div>
        )}
      </>
    );
  }

  if (currentScreen === "ftue") {
    return (
      <FTUEWelcomeScreen
        onMaybeLater={goToHome}
        onGetStarted={goToMap}
      />
    );
  }

  if (currentScreen === "home") {
    return <HomeScreen />;
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

  return <LoginScreen onSignUp={goToSignUp} onMapShortcut={goToMap} />;
}

export default App;
