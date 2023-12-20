import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Game from './Game';

const StartGame = () => {
  const navigate = useNavigate();
  const [playerDecks, setPlayerDecks] = useState([]);
  const [opponentDecks, setOpponentDecks] = useState([]);
  const [selectedPlayerDeck, setSelectedPlayerDeck] = useState(null);
  const [selectedOpponentDeck, setSelectedOpponentDeck] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerCreatures, setPlayerCreatures] = useState([]);
  const [opponentCreatures, setOpponentCreatures] = useState([]);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const response = await fetch('/decks');
        const decksData = await response.json();
        setPlayerDecks(decksData);
        setOpponentDecks(decksData);
      } catch (error) {
        console.error('Error fetching decks:', error);
      }
    };

    fetchDecks();
  }, []);

// Inside the startGame function
const startGame = async () => {
  if (!selectedPlayerDeck || !selectedOpponentDeck) {
    console.error('Please select decks for both players.');
    return;
  }

  // Placeholder for fetching creatures in the deck
  const playerDeckCreatures = await fetchCreaturesInDeck(selectedPlayerDeck.id);
  const opponentDeckCreatures = await fetchCreaturesInDeck(selectedOpponentDeck.id);

  setPlayerCreatures(playerDeckCreatures);
  setOpponentCreatures(opponentDeckCreatures);

  setGameStarted(true);

  // Navigate to the "/game" route with state
  navigate('/game', { state: { playerDeck: playerDeckCreatures, opponentDeck: opponentDeckCreatures } });
};

  // Placeholder function
  const fetchCreaturesInDeck = async (deckId) => {
    try {
      // Replace the following lines with your actual API calls to fetch creatures in the deck
      const deckCreaturesResponse = await fetch(`/deckcreatures?deck_id=${deckId}`);
      const deckCreaturesData = await deckCreaturesResponse.json();

      const creatureIdsInSelectedDeck = deckCreaturesData
        .filter((association) => association.deck_id === deckId)
        .map((association) => association.creature_id);

      return creatureIdsInSelectedDeck;
    } catch (error) {
      console.error("Error fetching creatures in deck:", error);
      return [];
    }
  };

  return (
    <div>
      <h2>Start Game</h2>
      {!gameStarted && (
        <div>
          <h3>Select Decks:</h3>
          <div>
            <label>Player Deck:</label>
            <select onChange={(e) => setSelectedPlayerDeck(JSON.parse(e.target.value))}>
              <option value={null}>Select Deck</option>
              {playerDecks.map((deck) => (
                <option key={deck.id} value={JSON.stringify(deck)}>
                  {deck.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Opponent Deck:</label>
            <select onChange={(e) => setSelectedOpponentDeck(JSON.parse(e.target.value))}>
              <option value={null}>Select Deck</option>
              {opponentDecks.map((deck) => (
                <option key={deck.id} value={JSON.stringify(deck)}>
                  {deck.name}
                </option>
              ))}
            </select>
          </div>
          <button onClick={startGame}>Start Game</button>
        </div>
      )}
      {gameStarted && <Game playerDeck={playerCreatures} opponentDeck={opponentCreatures} />}
    </div>
  );
};

export default StartGame;
