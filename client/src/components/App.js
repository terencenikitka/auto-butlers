import React from "react";
import { Switch, Route, Outlet, useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import Creatures from "./Creatures";
import Home from "./Home";

function App() {
  const location = useLocation();

  return (
    <div >
      <header >
        <NavBar />
      </header>

      <div >
        <Outlet />
        {location.pathname === "/" && <Home />}
      </div>
    </div>
  );
}

export default App;
