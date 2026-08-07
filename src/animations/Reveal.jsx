import { motion } from "framer-motion";


function Reveal({children}){


return (

<motion.div


initial={{

opacity:0,

y:80

}}


whileInView={{

opacity:1,

y:0

}}


transition={{

duration:0.8,

ease:"easeOut"

}}


viewport={{

once:true

}}


>


{children}


</motion.div>


)

}


export default Reveal;