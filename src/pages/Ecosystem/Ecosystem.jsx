import "./Ecosystem.css";


function Ecosystem(){


const ecosystemItems = [

{
icon:"🪙",
title:"TEKA Token",
text:"The core asset powering the TEKA digital economy."
},


{
icon:"⚡",
title:"Technology Platform",
text:"Modern software solutions built for the next generation."
},


{
icon:"🔗",
title:"Blockchain Network",
text:"Secure and transparent decentralized infrastructure."
},


{
icon:"📈",
title:"Digital Economy",
text:"A sustainable ecosystem connecting users and innovation."
},


{
icon:"🌎",
title:"Global Community",
text:"A worldwide network building the future together."
},


{
icon:"🚀",
title:"Future Products",
text:"Next generation applications and experiences."
}

];



return(


<section className="ecosystem-page">


<div className="ecosystem-glow"></div>



<div className="ecosystem-header">


<p>
TEKA ECOSYSTEM
</p>


<h1>

One Ecosystem.
<br/>

<span>Infinite Possibilities.</span>

</h1>


<h2>

Connecting blockchain, technology
and digital innovation.

</h2>


</div>





<div className="ecosystem-grid">


{

ecosystemItems.map((item,index)=>(


<div 
className="ecosystem-card"
key={index}
>


<div className="ecosystem-icon">

{item.icon}

</div>


<h3>

{item.title}

</h3>


<p>

{item.text}

</p>



</div>


))

}


</div>





<div className="ecosystem-core">


<div className="core-circle">

TEKA

</div>


<div className="core-text">


<h2>

The Center Of Digital Innovation

</h2>


<p>

Every part of TEKA works together
to create a powerful technology ecosystem.

</p>


</div>


</div>



</section>


);


}


export default Ecosystem;