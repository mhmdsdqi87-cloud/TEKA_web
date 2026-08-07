import "./Roadmap.css";


function Roadmap(){


const phases = [

{
phase:"Phase 01",
title:"Foundation",
items:[
"TEKA Brand Launch",
"Smart Contract Development",
"Community Building"
]
},


{
phase:"Phase 02",
title:"Ecosystem",
items:[
"Website Platform",
"Token Integration",
"First Products Release"
]
},


{
phase:"Phase 03",
title:"Expansion",
items:[
"Exchange Listings",
"Strategic Partnerships",
"Global Community Growth"
]
},


{
phase:"Phase 04",
title:"Future Vision",
items:[
"Advanced Technology",
"Worldwide Ecosystem",
"Next Generation Solutions"
]
}

];



return(

<section className="roadmap">


<div className="roadmap-title">

<h2>
TEKA ROADMAP
</h2>

<p>
Building the future step by step.
</p>

</div>



<div className="timeline">


{
phases.map((item,index)=>(


<div 
className="road-card"
key={index}
>


<div className="road-dot"></div>


<div className="road-content">


<span>
{item.phase}
</span>


<h3>
{item.title}
</h3>


<ul>

{
item.items.map((x,i)=>(

<li key={i}>
{x}
</li>

))
}

</ul>


</div>


</div>


))

}



</div>



</section>

)


}


export default Roadmap;