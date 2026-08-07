import Hero from "../../components/Hero/Hero";
import Features from "../../components/Features/Features";
import Vision from "../../components/Vision/Vision";
import Tokenomics from "../../components/Tokenomics/Tokenomics";
import Roadmap from "../../components/Roadmap/Roadmap";
import FAQ from "../../components/FAQ/FAQ";
import Community from "../../components/Community/Community";
import TokenInfo from "../../components/TokenInfo/TokenInfo";
import Footer from "../../components/Footer/Footer";


function Home(){

return(
<>
<Hero />
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