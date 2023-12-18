import React from "react";
import { Switch, Route, Outlet, useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import Creatures from "./Creatures";
import Home from "./Home";
import Signup from "./Signup";

function App() {
  const location = useLocation();

  return (
    <div > <div >
        <Outlet />
        {location.pathname === "/" || <Signup />}
      </div>
      <header >
        <NavBar />
      </header>

     
    </div>
  );
}

export default App;
