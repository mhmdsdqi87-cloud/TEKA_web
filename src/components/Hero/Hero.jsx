import "./Hero.css";

import { Link } from "react-router-dom";

import MoltenMetal from "../MoltenMetal/MoltenMetal";
import logo from "../../assets/logo.png";


function Hero(){

return(

<section className="hero">


<MoltenMetal />



<div className="hero-content">


<img
src={logo}
className="hero-logo"
alt="TEKA Logo"
/>



<h1>
TEKA<span>.</span>
</h1>



<h2>
Building The Future
<br/>
Of Digital Technology
</h2>



<p>
A Web3 technology ecosystem focused on
<br/>
digital products, innovative tools,
<br/>
and future digital experiences.
</p>




<Link
to="/explore"
className="hero-button"
>

Explore Ecosystem →

</Link>



</div>


</section>


);


}


export default Hero;