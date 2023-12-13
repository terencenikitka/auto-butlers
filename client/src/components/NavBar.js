import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

function NavBar() {
   

    return (
        <ul>
            <li>
                <NavLink to="/Decks" className="nav-link">
                    View Decks
                </NavLink>
            </li>
            <li>
                <NavLink to="/Creatures" className="nav-link">
                    View Creatures
                </NavLink>
            </li>
            <li>
                <NavLink to="/game" className="nav-link">
                    Start Game
                </NavLink>
            </li>
        </ul>
    );
}

export default NavBar;
