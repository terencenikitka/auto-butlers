import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

function NavBar() {
   

    return (
        <ul>
            <li>
                <NavLink to="/decks" className="nav-link">
                    View Decks
                </NavLink>
            </li>
            <li>
                <NavLink to="/creatures" className="nav-link">
                    View Creatures
                </NavLink>
            </li>
             <li>
                <NavLink to="/createdeck" className="nav-link">
                    Create Deck
                </NavLink>
            </li>
            <li>
                <NavLink to="/startgame" className="nav-link">
                    Start Game
                </NavLink>
            </li>
           
        </ul>
    );
}

export default NavBar;
