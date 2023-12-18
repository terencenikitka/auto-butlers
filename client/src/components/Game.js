import React, { useState, useEffect } from 'react';

const Game = () => {
  const [playerDecks, setPlayerDecks] = useState([]);
  const [opponentDecks, setOpponentDecks] = useState([]);
  const [selectedPlayerDeck, setSelectedPlayerDeck] = useState(null);
  const [selectedOpponentDeck, setSelectedOpponentDeck] = useState(null);
  const [playerHand, setPlayerHand] = useState([]);
  const [opponentHand, setOpponentHand] = useState([]);
  const [playerMana, setPlayerMana] = useState(1);
  const [opponentMana, setOpponentMana] = useState(1);
  const [playerHealth, setPlayerHealth] = useState(30);
  const [opponentHealth, setOpponentHealth] = useState(30);
  const [table, setTable] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerCreatures, setPlayerCreatures] = useState([]);
  const [opponentCreatures, setOpponentCreatures] = useState([]);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5555/decks');
        const decksData = await response.json();
        setPlayerDecks(decksData);
        setOpponentDecks(decksData);
      } catch (error) {
        console.error('Error fetching decks:', error);
      }
    };

    fetchDecks();
  }, []);

  const fetchDeckCreatures = async (deckId) => {
    const response = await fetch(`http://127.0.0.1:5555/deckcreatures?deck_id=${deckId}`);
    return response.json();
  };

  const fetchCreatureInfo = async (creatureId) => {
    const response = await fetch(`http://127.0.0.1:5555/creatures/${creatureId}`);
    return response.json();
  };

  const initializeGameState = async (playerDeck, opponentDeck, initialPlayerHand, initialOpponentHand) => {
    try {
      const playerDeckCreaturesData = await fetchDeckCreatures(playerDeck.id);
      const opponentDeckCreaturesData = await fetchDeckCreatures(opponentDeck.id);

      const playerCreatures = await Promise.all(
        playerDeckCreaturesData.map(async (deckCreature) => {
          return fetchCreatureInfo(deckCreature.creature_id);
        })
      );

      const opponentCreatures = await Promise.all(
        opponentDeckCreaturesData.map(async (deckCreature) => {
          return fetchCreatureInfo(deckCreature.creature_id);
        })
      );

      return {
        playerHand: initialPlayerHand,
        opponentHand: initialOpponentHand,
        playerMana: 1,
        opponentMana: 1,
        playerCreatures,
        opponentCreatures,
      };
    } catch (error) {
      console.error('Error initializing game state:', error);
      return null;
    }
  };

  const startGame = async () => {
    if (!selectedPlayerDeck || !selectedOpponentDeck) {
      console.error('Please select decks for both players.');
      return;
    }

    const initialPlayerHand = drawInitialCards(selectedPlayerDeck);
    const initialOpponentHand = drawInitialCards(selectedOpponentDeck);

    const initialState = await initializeGameState(
      selectedPlayerDeck,
      selectedOpponentDeck,
      initialPlayerHand,
      initialOpponentHand
    );

    if (initialState) {
      setPlayerHand(initialState.playerHand);
      setOpponentHand(initialState.opponentHand);
      setPlayerMana(initialState.playerMana);
      setOpponentMana(initialState.opponentMana);
      setPlayerCreatures(initialState.playerCreatures);
      setOpponentCreatures(initialState.opponentCreatures);
      setTable([]);
      setGameStarted(true);
    }
  };

  const drawInitialCards = (deck) => {
    const initialHand = [];
    for (let i = 0; i < 2; i++) {
      const drawnCard = drawCard(deck);
      initialHand.push(drawnCard);
    }
    return initialHand;
  };

  const drawCard = (deck) => {
    if (!deck || !deck.cards || deck.cards.length === 0) {
      console.error('Invalid deck or empty cards array');
      return null;
    }

    return deck.cards[Math.floor(Math.random() * deck.cards.length)];
  };

  const endTurn = () => {
    console.log('End Turn');
    opponentTurn();
  };

  const opponentTurn = () => {
    console.log('Opponent Turn');
  };

  const playCard = (card) => {
    console.log(card)
    if (!card || !card.name) {
      console.error('Invalid card or missing name property');
      return;
    }

    console.log(`Play Card: ${card.name}`);
  };

  return (
    <div>
      <h2>Game</h2>
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
      {gameStarted && (
        <div>
          <div>
            <h3>Player Deck: {selectedPlayerDeck.name}</h3>
            <h3>Opponent Deck: {selectedOpponentDeck.name}</h3>
          </div>
          <div>
            <h3>Player Health: {playerHealth}</h3>
            <h3>Opponent Health: {opponentHealth}</h3>
          </div>
          <div>
            <h3>Player Mana: {playerMana}</h3>
            <h3>Opponent Mana: {opponentMana}</h3>
          </div>
          <button onClick={endTurn}>End Turn</button>
          <div>
            <h3>Player Hand:</h3>
            {playerHand.map((card) => (
              <div key={card.id}>
                <p>{card.name}</p>
                <button onClick={() => playCard(card)}>Play Card</button>
              </div>
            ))}
          </div>
          <div>
            <h3>Player Creatures:</h3>
            {playerCreatures.map((creature) => (
              <div key={creature.id}>
                <p>{creature.name}</p>
                <p>Health: {creature.health}</p>
                
              </div>
            ))}
          </div>
          <div>
            <h3>Opponent Creatures:</h3>
            {opponentCreatures.map((creature) => (
              <div key={creature.id}>
                <p>{creature.name}</p>
                <p>Health: {creature.health}</p>
                {/* Add other properties you want to display */}
              </div>
            ))}
          </div>
          <div>
            <h3>Table:</h3>
            {table.map((creature) => (
              <div key={creature.id}>
                <p>{creature.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
