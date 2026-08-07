import { useEffect, useState } from "react";
import "./Cursor.css";


function Cursor(){

const [position,setPosition]=useState({
x:0,
y:0
});


useEffect(()=>{


const move=(e)=>{

setPosition({

x:e.clientX,
y:e.clientY

});

};


window.addEventListener(
"mousemove",
move
);


return()=>{

window.removeEventListener(
"mousemove",
move
);

};


},[]);



return(

<div

className="cursor"

style={{

left:`${position.x}px`,
top:`${position.y}px`

}}

></div>

)

}


export default Cursor;