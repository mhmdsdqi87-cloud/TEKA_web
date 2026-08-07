import "./Explore.css";

import logo from "../../assets/logo.png";


function Explore(){


return(


<section className="explore-page">



<div className="explore-glow"></div>



<div className="explore-particles">

<span></span>
<span></span>
<span></span>
<span></span>
<span></span>

</div>





<div className="explore-content">



<p className="explore-tag">

WELCOME TO TEKA

</p>




<img

src={logo}

className="explore-logo"

alt="TEKA"

 />





<h1>

Enter The

<span>

Future

</span>

</h1>




<p className="explore-text">

A new era of technology,
innovation and digital experiences.

TEKA is building the infrastructure
for tomorrow's digital world.

</p>





<div className="explore-buttons">


<a href="/ecosystem">

Explore Ecosystem

</a>



<a href="/technology">

Discover Technology

</a>



</div>




</div>





<div className="scroll">

SCROLL TO EXPERIENCE ↓

</div>



</section>


);


}


export default Explore;