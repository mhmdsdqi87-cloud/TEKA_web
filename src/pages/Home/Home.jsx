import Hero from "../../components/Hero/Hero";
import MarketDashboard from "../../components/MarketDashboard/MarketDashboard";
import Features from "../../components/Features/Features";
import Vision from "../../components/Vision/Vision";
import Tokenomics from "../../components/Tokenomics/Tokenomics";
import Roadmap from "../../components/Roadmap/Roadmap";
import FAQ from "../../components/FAQ/FAQ";
import Community from "../../components/Community/Community";
import TokenInfo from "../../components/TokenInfo/TokenInfo";
import Footer from "../../components/Footer/Footer";

import LiveVisitors from "../../components/LiveVisitors/LiveVisitors";

function Home() {
  return (
    <>
      <Hero />

      <div className="live-visitors-wrapper">
        <LiveVisitors />
      </div>

      <MarketDashboard />

      <Features />

      <Vision />

      <Tokenomics />

      <Roadmap />

      <FAQ />

      <Community />

      <TokenInfo />

      <Footer />
    </>
  );
}

export default Home;