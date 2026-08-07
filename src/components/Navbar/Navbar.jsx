import "./Navbar.css";
import { Link } from "react-router-dom";
import { useState } from "react";


function Navbar(){


const [open, setOpen] = useState(false);



return(


<nav className="navbar">



<Link
to="/"
className="navbar-logo"
onClick={()=>setOpen(false)}
>
TEKA
</Link>





<div className={`navbar-links ${open ? "active" : ""}`}>


<Link 
to="/about"
onClick={()=>setOpen(false)}
>
About
</Link>


<Link 
to="/ecosystem"
onClick={()=>setOpen(false)}
>
Ecosystem
</Link>


<Link 
to="/technology"
onClick={()=>setOpen(false)}
>
Technology
</Link>


<Link 
to="/token"
onClick={()=>setOpen(false)}
>
Token
</Link>


<Link 
to="/contact"
onClick={()=>setOpen(false)}
>
Contact
</Link>



</div>







<Link
to="/explore"
className="navbar-button"
>
Launch
</Link>






<button

className="menu-button"

onClick={()=>setOpen(!open)}

>


<span></span>

<span></span>

<span></span>


</button>




</nav>


);


}


export default Navbar;