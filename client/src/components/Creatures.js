import React, { useEffect, useState } from "react";

function Creatures() {
  const [creatures, setCreatures] = useState([]);

  useEffect(() => {
    fetch("/creatures")
      .then((response) => response.json())
      .then((data) => setCreatures(data))
      .catch((error) => console.error("Error fetching creatures:", error));
  }, []);

  return (
    <div>
      <h2>Creatures</h2>
      <ul>
        {creatures.map((creature) => (
          <li key={creature.id}>
            <strong>Name:</strong> {creature.name}, <strong>Cost:</strong>{" "}
            {creature.cost}, <strong>Attack:</strong> {creature.attack},{" "}
            <strong>Health:</strong> {creature.health}, 
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Creatures;
