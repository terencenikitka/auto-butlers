import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CreateDeck() {
  const [newDeckName, setNewDeckName] = useState('');
  const [userIds, setUserIds] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedCreatures, setSelectedCreatures] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserIds();
  }, []);

  useEffect(() => {
    fetchCreatureIds();
  }, []);

  const fetchUserIds = async () => {
    try {
      const response = await fetch("/users");
      if (!response.ok) {
        throw new Error("Error fetching user IDs");
      }

      const data = await response.json();
      setUserIds(data.map((user) => user.id));
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchCreatureIds = async () => {
    try {
      const response = await fetch("/creatures");
      if (!response.ok) {
        throw new Error("Error fetching creature IDs");
      }

      const data = await response.json();
      const creatureIds = data.map((creature) => creature.id);
      setSelectedCreatures(creatureIds);
    } catch (error) {
      console.error(error.message);
    }
  };

  const generateRandomUserId = () => {
    const randomIndex = Math.floor(Math.random() * userIds.length);
    return userIds[randomIndex];
  };

  const generateRandomCreatureIds = (count) => {
    const shuffledCreatureIds = selectedCreatures.sort(() => 0.5 - Math.random());
    return shuffledCreatureIds.slice(0, count);
  };

  const createDeck = async () => {
    try {
      if (newDeckName.trim() !== '' && selectedUserId !== null) {
        const deckResponse = await fetch("/decks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newDeckName.trim(),
            user_id: selectedUserId,
          }),
        });

        if (!deckResponse.ok) {
          throw new Error(`Error creating deck: ${deckResponse.statusText}`);
        }

        console.log("Deck created successfully");

        const deckData = await deckResponse.json();
        const createdDeckId = deckData.id;

        const randomCreatureIds = generateRandomCreatureIds(10);

        const deckCreaturesResponses = await Promise.all(
          randomCreatureIds.map(async (creatureId) => {
            try {
                console.log(createdDeckId)
              const deckCreatureResponse = await fetch("/deckcreatures", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  deck_id: createdDeckId,
                  creature_id: creatureId,
                }),
              });

              if (!deckCreatureResponse.ok) {
                const errorData = await deckCreatureResponse.json();
                throw new Error(`Error creating deck creature: ${errorData.message}`);
              }

              return true;
            } catch (error) {
              console.error(error.message);
              return false;
            }
          })
        );

        if (deckCreaturesResponses.every((response) => response)) {
          console.log("Deck creatures created successfully");

          setNewDeckName('');
          setSelectedUserId(null);
          setSelectedCreatures([]);

          navigate('/');
        } else {
          console.error("Error creating deck creatures");
        }
      } else {
        console.error("Please enter a valid deck name and select a user");
      }
    } catch (error) {
      console.error("Error creating deck:", error.message);
    }
  };

  return (
    <div>
      <h2>Create Deck</h2>
      <label>
        Deck Name:
        <input
          type="text"
          value={newDeckName}
          onChange={(e) => setNewDeckName(e.target.value)}
        />
      </label>
      {/* <label>
        Select User:
        <select onChange={(e) => setSelectedUserId(parseInt(e.target.value))}>
          <option value="" disabled selected>
            -- Select a user --
          </option>
          {userIds.map((userId) => (
            <option key={userId} value={userId}>
              User {userId}
            </option>
          ))}
        </select>
      </label> */}
      <button onClick={createDeck}>Create Deck</button>
    </div>
  );
}

export default CreateDeck;
