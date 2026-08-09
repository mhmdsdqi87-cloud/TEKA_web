import "./Ecosystem.css";


function Ecosystem(){


const ecosystemItems = [

{
icon:"🪙",
title:"TEKA Token",
text:"A utility token designed to power digital products, services, and experiences inside the TEKA ecosystem."
},


{
icon:"⚡",
title:"Technology Platform",
text:"Innovative digital tools and technology solutions designed for future users and evolving digital needs."
},


{
icon:"🔗",
title:"Blockchain Infrastructure",
text:"Blockchain-based infrastructure enabling secure, transparent, and reliable digital experiences."
},


{
icon:"📈",
title:"Digital Economy",
text:"A digital economy connecting users, products, and future technology through meaningful experiences."
},


{
icon:"🌎",
title:"Global Community",
text:"A growing community of creators, developers, and technology enthusiasts building together."
},


{
icon:"🚀",
title:"Future Products",
text:"Future digital products and experiences designed to expand the TEKA ecosystem."
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

A technology ecosystem combining
<br/>
Web3, digital products, and future innovation.

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
to create a connected technology ecosystem
focused on digital products, blockchain,
and future experiences.

</p>


</div>


</div>



</section>


);


}


export default Ecosystem;