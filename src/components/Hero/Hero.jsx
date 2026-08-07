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
Of Digital Innovation
</h2>



<p>
A technology brand creating
<br/>
modern solutions for the digital era.
</p>




<Link
to="/explore"
className="hero-button"
>

Explore TEKA →

</Link>



</div>


</section>


);


}


export default Hero;