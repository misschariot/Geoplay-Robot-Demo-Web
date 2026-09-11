import GlobalHeader from "../components/GlobalHeader";
import GlobalBottomNav from "../components/GlobalBottomNav";

function HomeScreen() {
  return (
    <main className="home-screen">
      <GlobalHeader />

      <div className="home-content">
        <h1>HOME</h1>
        <p>Home content coming soon.</p>
      </div>

      <GlobalBottomNav activeScreen="home" />
    </main>
  );
}

export default HomeScreen;
