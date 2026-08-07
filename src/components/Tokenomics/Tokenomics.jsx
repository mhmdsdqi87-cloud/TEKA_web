import "./Tokenomics.css";
import Reveal from "../../animations/Reveal";


function Tokenomics(){


const tokenData = [

{
title:"Ecosystem & Community",
percent:40,
amount:"40,000,000 TEKA",
color:"#FFD700"
},

{
title:"Development & Technology",
percent:20,
amount:"20,000,000 TEKA",
color:"#ffffff"
},

{
title:"Liquidity",
percent:15,
amount:"15,000,000 TEKA",
color:"#00d4ff"
},

{
title:"Marketing & Growth",
percent:10,
amount:"10,000,000 TEKA",
color:"#ff8c00"
},

{
title:"Team & Founders",
percent:10,
amount:"10,000,000 TEKA",
color:"#a855f7"
},

{
title:"Reserve",
percent:5,
amount:"5,000,000 TEKA",
color:"#555555"
}

];



// ساخت گرادیانت صحیح چارت

let current = 0;


const chart = tokenData.map(item=>{

const start = current;

current += item.percent;


return `${item.color} ${start}% ${current}%`;

}).join(",");



return(


<section className="tokenomics">



<Reveal>


<div className="token-title">


<span>
TOKEN ECONOMY
</span>


<h2>
TEKA TOKENOMICS
</h2>


<p>
A sustainable economy designed for the future of digital innovation.
</p>


</div>


</Reveal>





<div className="token-wrapper">



<Reveal>


<div

className="token-chart"

style={{

background:`conic-gradient(${chart})`

}}

>


<div className="chart-center">


<h3>
TEKA
</h3>


<strong>
100M
</strong>


<span>
TOTAL SUPPLY
</span>


</div>


</div>


</Reveal>






<div className="token-list">


{

tokenData.map((item,index)=>(


<Reveal

key={index}

index={index}

>


<div className="token-card">



<div

className="token-color"

style={{

background:item.color

}}

></div>




<div>


<h3>
{item.title}
</h3>



<p>

{item.percent}%

<span>
{item.amount}
</span>

</p>


</div>



</div>


</Reveal>


))

}



</div>




</div>



</section>


)


}


export default Tokenomics;