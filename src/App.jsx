import { BrowserRouter, Routes, Route } from "react-router-dom";



import Navbar from "./components/Navbar/Navbar";
import Cursor from "./components/Cursor/Cursor";
import Loader from "./components/Loader/Loader";
import PageTransition from "./components/PageTransition/PageTransition";



// Pages
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Ecosystem from "./pages/Ecosystem/Ecosystem";
import Technology from "./pages/Technology/Technology";
import Token from "./pages/Token/Token";
import Contact from "./pages/Contact/Contact";
import Explore from "./pages/Explore/Explore";



// Feature Pages
import Premium from "./pages/Premium/Premium";
import Performance from "./pages/Performance/Performance";
import Security from "./pages/Security/Security";
import GlobalVision from "./pages/GlobalVision/GlobalVision";

import TEKAReveal from "./components/TEKAReveal/TEKAReveal";





function App(){


return(


<BrowserRouter>



<Loader />


<TEKAReveal />



<Cursor />



<Navbar />





<PageTransition>


<Routes>



<Route
path="/"
element={<Home />}
/>



<Route
path="/about"
element={<About />}
/>



<Route
path="/ecosystem"
element={<Ecosystem />}
/>



<Route
path="/technology"
element={<Technology />}
/>



<Route
path="/token"
element={<Token />}
/>



<Route
path="/contact"
element={<Contact />}
/>



<Route
path="/explore"
element={<Explore />}
/>



<Route
path="/premium"
element={<Premium />}
/>



<Route
path="/performance"
element={<Performance />}
/>



<Route
path="/security"
element={<Security />}
/>



<Route
path="/global-vision"
element={<GlobalVision />}
/>



</Routes>


</PageTransition>




</BrowserRouter>


);


}



export default App;