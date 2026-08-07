import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import "./PageTransition.css";


function PageTransition({children}){


const location = useLocation();


return(


<AnimatePresence mode="wait">


<motion.div


key={location.pathname}


initial={{
opacity:0,
y:30,
filter:"blur(15px)"
}}



animate={{
opacity:1,
y:0,
filter:"blur(0px)"
}}



exit={{
opacity:0,
y:-30,
filter:"blur(15px)"
}}



transition={{
duration:.6,
ease:"easeInOut"
}}


className="page-transition"


>


{children}


</motion.div>


</AnimatePresence>


);


}


export default PageTransition;