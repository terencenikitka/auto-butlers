import React, { useState, useEffect } from 'react';

function Decks() {
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [creaturesInDeck, setCreaturesInDeck] = useState([]);
  const [newDeckName, setNewDeckName] = useState('');

  useEffect(() => {
    fetch("http://127.0.0.1:5555/decks")
      .then((response) => response.json())
      .then((data) => setDecks(data))
      .catch((error) => console.error("Error fetching decks:", error));
  }, []);

  const fetchCreaturesInDeck = async (deckId) => {
    try {
      const creaturesResponse = await fetch("http://127.0.0.1:5555/creatures");
      const creaturesData = await creaturesResponse.json();

      const deckCreaturesResponse = await fetch("http://127.0.0.1:5555/deckcreatures");
      const deckCreaturesData = await deckCreaturesResponse.json();

      const creatureIdsInSelectedDeck = deckCreaturesData
        .filter((association) => association.deck_id === deckId)
        .map((association) => association.creature_id);

      const creaturesInSelectedDeck = creaturesData.filter(
        (creature) => creatureIdsInSelectedDeck.includes(creature.id)
      );

      setCreaturesInDeck(creaturesInSelectedDeck);
      setSelectedDeckId(deckId);
    } catch (error) {
      console.error("Error fetching creatures in deck:", error);
    }
  };

  const handleDeckRename = async () => {
    if (newDeckName.trim() !== '' && selectedDeckId !== null) {
      try {
        const response = await fetch(`http://127.0.0.1:5555/decks/${selectedDeckId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newDeckName.trim(),
          }),
        });

        if (response.ok) {
          const updatedDecks = decks.map((deck) =>
            deck.id === selectedDeckId ? { ...deck, name: newDeckName.trim() } : deck
          );

          setDecks(updatedDecks);
          setNewDeckName('');
        } else {
          console.error("Error renaming deck:", response.statusText);
        }
      } catch (error) {
        console.error("Error renaming deck:", error);
      }
    }
  };

  const handleDeckDelete = async (deckId) => {
    if (window.confirm("Are you sure you want to delete this deck?")) {
      try {
        const response = await fetch(`http://127.0.0.1:5555/decks/${deckId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          const updatedDecks = decks.filter((deck) => deck.id !== deckId);
          setDecks(updatedDecks);
          setCreaturesInDeck([]);
          setSelectedDeckId(null);
        } else {
          console.error("Error deleting deck:", response.statusText);
        }
      } catch (error) {
        console.error("Error deleting deck:", error);
      }
    }
  };

  return (
    <div>
      <h2>Decks</h2>
      {decks.map((deck) => (
        <div key={deck.id} className="deck-card">
          <h3>{deck.name}</h3>
          <button onClick={() => fetchCreaturesInDeck(deck.id)}>Show Creatures</button>
          <button onClick={() => handleDeckDelete(deck.id)}>Delete Deck</button>
          {selectedDeckId === deck.id && (
            <div>
              <h4>Creatures in {deck.name}</h4>
              <ul>
                {creaturesInDeck.map((creature) => (
                  <li key={creature.id}>{creature.name}</li>
                ))}
              </ul>
              <input
                type="text"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="Enter new deck name"
              />
              <button onClick={handleDeckRename} disabled={!newDeckName.trim()}>
                Rename Deck
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Decks;
