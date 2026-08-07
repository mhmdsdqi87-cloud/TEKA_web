import "./Navbar.css";

import { Link } from "react-router-dom";


function Navbar(){


return(


<nav className="navbar">



<Link
to="/"
className="navbar-logo"
>

TEKA

</Link>





<div className="navbar-links">



<Link to="/about">
About
</Link>



<Link to="/ecosystem">
Ecosystem
</Link>



<Link to="/technology">
Technology
</Link>



<Link to="/token">
Token
</Link>



<Link to="/contact">
Contact
</Link>



</div>





<Link

to="/explore"

className="navbar-button"

>

Launch

</Link>



</nav>


);


}


export default Navbar;