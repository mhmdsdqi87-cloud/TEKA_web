import "./Features.css";

import { Link } from "react-router-dom";


function Features(){


return(


<section className="features">



<div className="features-header">



<div className="features-badge">

TEKA FEATURES

</div>



<h1 className="features-title">

Built For The Future

</h1>



<p className="features-subtitle">

Powerful technology designed for speed,
security and a premium digital experience.

</p>



</div>





<div className="features-grid">





<Link 
to="/performance"
className="feature-card"
>


<div className="feature-glow"></div>



<div className="feature-icon">

⚡

</div>



<h3>

High Performance

</h3>



<p>

Built for speed, scalability and
next generation applications.

</p>



<div className="feature-arrow">

→

</div>



</Link>








<Link 
to="/security"
className="feature-card"
>


<div className="feature-glow"></div>



<div className="feature-icon">

🔒

</div>



<h3>

Secure by Design

</h3>



<p>

Security is integrated into every
layer of the ecosystem.

</p>



<div className="feature-arrow">

→

</div>



</Link>








<Link 
to="/premium"
className="feature-card"
>


<div className="feature-glow"></div>



<div className="feature-icon">

💎

</div>



<h3>

Premium Experience

</h3>



<p>

Minimal, elegant and crafted with
attention to every detail.

</p>



<div className="feature-arrow">

→

</div>



</Link>








<Link 
to="/global-vision"
className="feature-card"
>


<div className="feature-glow"></div>



<div className="feature-icon">

🌍

</div>



<h3>

Global Vision

</h3>



<p>

Creating technology for users
everywhere in the world.

</p>



<div className="feature-arrow">

→

</div>



</Link>





</div>



</section>


);


}


export default Features;