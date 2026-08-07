import "./FAQ.css";


function FAQ(){


const questions=[

{
q:"What is TEKA?",
a:"TEKA is a technology ecosystem focused on building modern digital solutions and blockchain innovations."
},


{
q:"What is the total supply of TEKA?",
a:"The total supply of TEKA is 100,000,000 tokens."
},


{
q:"Where can I buy TEKA?",
a:"TEKA will be available through decentralized and centralized exchanges in future phases."
},


{
q:"Is TEKA open source?",
a:"Development progress and ecosystem updates will be shared with the community."
},


{
q:"What is the vision of TEKA?",
a:"Our vision is creating a powerful digital ecosystem connecting technology, blockchain and innovation."
}


]



return(

<section className="faq">


<h1>
FREQUENTLY ASKED QUESTIONS
</h1>



<div className="faq-container">


{
questions.map((item,index)=>(

<div className="faq-card" key={index}>


<h3>
{item.q}
</h3>


<p>
{item.a}
</p>


</div>

))
}



</div>


</section>

)

}


export default FAQ;