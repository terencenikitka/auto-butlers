import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Paper, Button, Typography } from '@mui/material';
import { css } from '@emotion/react';



const cardStyle = css`
  border: 1px solid #000;
  padding: 8px;
  cursor: pointer;
`;

const containerStyle = css`
  display: flex;
  gap: 16px;
`;

const battleLogStyle = css`
  flex: 1;
`;

const playerInfoStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
`;

const opponentFieldStyle = css`
  padding: 16px;
  margin-bottom: 16px;
  text-align: center;
`;


const Game = () => {
  const [playerHand, setPlayerHand] = useState([]);
  const [opponentHand, setOpponentHand] = useState([]);
  const [playerDeckState, setPlayerDeckState] = useState([]);
  const [opponentDeckState, setOpponentDeckState] = useState([]);
  const [playerField, setPlayerField] = useState([]);
  const [opponentField, setOpponentField] = useState([]);
  const [maxMana, setMaxMana] = useState(1);
  const [mana, setMana] = useState(0);
  const [opponentMana, setOpponentMana] = useState(0);
  const [maxOpponentMana, setMaxOpponentMana] = useState(1);
  const [turnEnded, setTurnEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remainingPlayerDeck, setRemainingPlayerDeck] = useState(0);
  const [remainingOpponentDeck, setRemainingOpponentDeck] = useState(0);
  const [damageDealt, setDamageDealt] = useState(0);
  const [damageReceived, setDamageReceived] = useState(0);
  const [opponentDrawn, setOpponentDrawn] = useState(false);
  const [attacker, setAttacker] = useState(null);
  const [target, setTarget] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [opponentHealth, setOpponentHealth] = useState(100);

  const { playerDeck, opponentDeck } = useLocation().state;

  useEffect(() => {
    initializeGame();
  }, [playerDeck, opponentDeck]);

  const initializeGame = async () => {
    try {
      const playerDeckCreatures = await fetchCreaturesInDeck(playerDeck);
      const opponentDeckCreatures = await fetchCreaturesInDeck(opponentDeck);

      setPlayerDeckState(playerDeckCreatures);
      setOpponentDeckState(opponentDeckCreatures);

      setRemainingPlayerDeck(playerDeckCreatures.length);
      setRemainingOpponentDeck(opponentDeckCreatures.length);

      await drawInitialHands(playerDeckCreatures, opponentDeckCreatures, 2);

      setMana(1);
      setOpponentMana(1);
      setTurnEnded(false);
      setMaxMana(1);
      setMaxOpponentMana(1);

      setLoading(false);
    } catch (error) {
      console.error('Error initializing game:', error);
      setError('Error initializing game. Please try again.');
      setLoading(false);
    }
  };

  const drawInitialHands = async (playerDeckCreatures, opponentDeckCreatures, numCards) => {
    console.log('Drawing initial hands...');
    const playerInitialCards = drawInitialCards(playerDeckCreatures, numCards, setRemainingPlayerDeck);
    const opponentInitialCards = drawInitialCards(opponentDeckCreatures, numCards, setRemainingOpponentDeck);
    setPlayerHand(playerInitialCards);
    setOpponentHand(opponentInitialCards);
  };

  const fetchCreaturesInDeck = async (deck) => {
    try {
      const creaturesResponse = await fetch(`/creatures?id=${deck.join(',')}`);
      const creaturesData = await creaturesResponse.json();
      const selectedCreatures = creaturesData.filter((el) => deck.includes(el.id));
      return selectedCreatures;
    } catch (error) {
      console.error('Error fetching creatures in deck:', error);
      return [];
    }
  };

  const drawInitialCards = (deck, numCards, remainingDeckSetter) => {
    const hand = [];
    const newDeck = [...deck];
    const uniqueCards = new Set();

    for (let i = 0; i < numCards; i++) {
      if (newDeck.length === 0) {
        console.warn('Deck is empty!');
        break;
      }

      const randomIndex = Math.floor(Math.random() * newDeck.length);
      const drawnCard = newDeck.splice(randomIndex, 1)[0];

      if (!uniqueCards.has(drawnCard.id)) {
        hand.push(drawnCard);
        uniqueCards.add(drawnCard.id);

        const cardIndexInDeck = deck.findIndex((card) => card.id === drawnCard.id);
        if (cardIndexInDeck !== -1) {
          deck.splice(cardIndexInDeck, 1);
          remainingDeckSetter(deck.length);
        }
      }
    }

    return hand;
  };

  const drawInitialPlayerCards = async (numCards) => {
    console.log('Drawing initial player cards...');
    return new Promise((resolve) => {
      setPlayerHand((prevHand) => {
        const drawnCards = drawInitialCards(playerDeckState, numCards, setRemainingPlayerDeck);
        resolve([...prevHand, ...drawnCards]);
        return [...prevHand, ...drawnCards];
      });
    });
  };

  const drawInitialOpponentCards = async (numCards) => {
    console.log('Drawing initial opponent cards...');
    try {
      setOpponentDeckState((prevDeck) => {
        const drawnCards = drawInitialCards(prevDeck, numCards, setRemainingOpponentDeck);
        setOpponentHand((prevHand) => [...prevHand, ...drawnCards]);
        return prevDeck.filter((card) => !drawnCards.some((drawnCard) => drawnCard.id === card.id));
      });
    } catch (error) {
      console.error('Error drawing initial opponent cards:', error);
    }
  };

  const playCard = (card, isPlayerCard) => {
    const updatedHand = isPlayerCard
      ? playerHand.filter((c) => c !== card)
      : opponentHand.filter((c) => c !== card);

    if (isPlayerCard && card.cost <= mana) {
      setPlayerHand(updatedHand);
      setMana(mana - card.cost);
      setPlayerField([...playerField, { ...card, hasAttacked: false }]);
      setDamageDealt(card.attack);
      setAttacker(card);
      setTarget(null);
    } else if (!isPlayerCard && card.cost <= opponentMana) {
      setOpponentHand(updatedHand);
      setOpponentMana(opponentMana - card.cost);
      setOpponentField([...opponentField, { ...card, hasAttacked: false }]);
      setDamageReceived(card.attack);
      setAttacker(null);
      setTarget(card);
    }
  };

  const performCreatureAttack = async () => {
    setIsPlayerAttacking(true);

    const newBattleLog = [];

    for (const playerCard of playerField) {
      if (!playerCard || playerCard.hasAttacked) {
        continue; // Пропускаем существ, которые уже атаковали в текущем ходе
      }

      const randomOpponentIndex = Math.floor(Math.random() * opponentField.length);
      const opponentCard = opponentField[randomOpponentIndex];

      if (opponentCard && opponentCard.health > 0) {
        const playerDamage = playerCard.attack;
        const opponentDamage = opponentCard.attack;

        const updatedPlayerField = playerField.map((card) => ({
          ...card,
          hasAttacked: card === playerCard ? true : card.hasAttacked,
          health: Math.max(0, card.health - opponentDamage),
        })).filter((card) => card.health > 0);

        setPlayerField(updatedPlayerField);

        const updatedOpponentField = [...opponentField];
        updatedOpponentField[randomOpponentIndex].health -= playerDamage;

        if (updatedOpponentField[randomOpponentIndex].health <= 0) {
          const target = updatedOpponentField[randomOpponentIndex];
          updatedOpponentField.splice(randomOpponentIndex, 1);
          setOpponentField(updatedOpponentField);

          setDamageReceived(opponentDamage);
          setDamageDealt(playerDamage);
          setAttacker(playerCard);
          setTarget(target);

          newBattleLog.push({
            attacker: playerCard.name,
            target: target.name,
            damageDealt: playerDamage,
            damageReceived: opponentDamage,
          });
        }
      } else {
        // Атака героя, если нет существ противника
        setOpponentHealth((prevHealth) => Math.max(0, prevHealth - playerCard.attack));
      }
    }

    setBattleLog((prevBattleLog) => [...prevBattleLog, ...newBattleLog]);
    setIsPlayerAttacking(false);
  };

  const handleOpponentTurn = async () => {
    try {
      if (!opponentDrawn) {
        drawInitialOpponentCards(1);
        setOpponentDrawn(true);
        console.log('Opponent drew a card.');
      }

      let opponentCard = getOpponentPlay();

      if (opponentCard) {
        playCard(opponentCard, false);
        console.log('Opponent played a card:', opponentCard);
      } else {
        console.log('Opponent cannot play a card. Ending turn.');
      }

      setMaxOpponentMana((prevMaxMana) => Math.min(prevMaxMana + 1, 10));
      setOpponentMana(Math.min(maxOpponentMana + 1, 10));

      await new Promise((resolve) => setTimeout(resolve, 1000));

      performCreatureAttack();
      setTurnEnded(false);

      startOpponentCreatureAttacks();

      setOpponentDrawn(false);
    } catch (error) {
      console.error('Error handling opponent turn:', error);
    }
  };

  const getOpponentPlay = () => {
    const playableCards = opponentHand.filter((card) => card.cost <= opponentMana);

    if (playableCards.length > 0) {
      const randomIndex = Math.floor(Math.random() * playableCards.length);
      return playableCards[randomIndex];
    }

    return null;
  };

  const startOpponentCreatureAttacks = () => {
    if (!isPlayerAttacking) {
      performOpponentCreatureAttacks();
    }
  };

  const performOpponentCreatureAttacks = async () => {
    const newBattleLog = [];

    for (const opponentCard of opponentField) {
      const randomPlayerIndex = Math.floor(Math.random() * playerField.length);
      const playerCard = playerField[randomPlayerIndex];

      if (opponentCard && playerCard && playerCard.health > 0) {
        const opponentDamage = opponentCard.attack;
        const playerDamage = playerCard.attack;

        const updatedOpponentField = opponentField.map((card) => ({
          ...card,
          health: Math.max(0, card.health - playerDamage),
        })).filter((card) => card.health > 0);

        setOpponentField(updatedOpponentField);

        const updatedPlayerField = [...playerField];
        updatedPlayerField[randomPlayerIndex].health -= opponentDamage;

        if (updatedPlayerField[randomPlayerIndex].health <= 0) {
          const target = updatedPlayerField[randomPlayerIndex];
          updatedPlayerField.splice(randomPlayerIndex, 1);
          setPlayerField(updatedPlayerField);

          newBattleLog.push({
            attacker: opponentCard.name,
            target: target.name,
            damageDealt: opponentDamage,
            damageReceived: playerDamage,
          });
        }
      }

      // Add a delay after each attack
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setBattleLog((prevBattleLog) => [...prevBattleLog, ...newBattleLog]);
  };

  const endTurn = async () => {
    setMaxMana((prevMaxMana) => Math.min(prevMaxMana + 1, 10));
    setMana(Math.min(maxMana + 1, 10));

    await handleOpponentTurn();

    await drawInitialPlayerCards(1);

    performCreatureAttack();

    setTurnEnded(false);
  };

  const isPlayerTurn = !turnEnded;

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div css={containerStyle}>
      <div css={battleLogStyle}>
        <Paper elevation={3} style={{ padding: 16, marginBottom: 16 }}>
          <Typography variant="h5">Battle Log:</Typography>
          <ul>
            {battleLog.map((entry, index) => (
              <li key={index}>
                {entry.attacker} attacked {entry.target} - Damage Dealt: {entry.damageDealt}, Damage Received: {entry.damageReceived}
              </li>
            ))}
          </ul>
        </Paper>
      </div>

      <div css={playerInfoStyle}>
        <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
          <Typography variant="h5">Player Health: {playerHealth}</Typography>
        </Paper>

        <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
          <Typography variant="h5">Player Hand (Mana: {mana}/{maxMana}):</Typography>
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'row' }}>
            {playerHand.map((card) => (
              <div
                key={card.id}
                onClick={() => isPlayerTurn && playCard(card, true)}
                style={{
                  ...cardStyle,
                  cursor: isPlayerTurn && card.cost <= mana ? 'pointer' : 'not-allowed',
                }}
              >
                <Typography variant="body1">Name: {card.name}</Typography>
                <Typography variant="body1">Cost: {card.cost}</Typography>
                <Typography variant="body1">Attack: {card.attack}</Typography>
                <Typography variant="body1">Health: {card.health}</Typography>
              </div>
            ))}
          </div>
        </Paper>

        <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
          <Typography variant="h5">Player Field:</Typography>
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'row' }}>
            {playerField.map((card) => (
              <div
                key={card.id}
                style={cardStyle}
              >
                <Typography variant="body1">Name: {card.name}</Typography>
                <Typography variant="body1">Attack: {card.attack}</Typography>
                <Typography variant="body1">Health: {card.health}</Typography>
              </div>
            ))}
          </div>
        </Paper>
      </div>

      <Paper css={opponentFieldStyle} elevation={3}>
        <Typography variant="h5">Opponent Field:</Typography>
        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column-reverse' }}>
          {opponentField.map((card) => (
            <div
              key={card.id}
              style={cardStyle}
            >
              <Typography variant="body1">Name: {card.name}</Typography>
              <Typography variant="body1">Attack: {card.attack}</Typography>
              <Typography variant="body1">Health: {card.health}</Typography>
            </div>
          ))}
        </div>
      </Paper>

      <div css={playerInfoStyle}>
        <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
          <Typography variant="h5">Opponent Health: {opponentHealth}</Typography>
        </Paper>

        <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
          <Typography variant="h5">Opponent Hand (Mana: {opponentMana}/{maxOpponentMana}):</Typography>
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column-reverse' }}>
            {opponentHand.map((card) => (
              <div
                key={card.id}
                style={{ ...cardStyle, cursor: 'not-allowed' }}
              >
                <Typography variant="body1">Name: {card.name}</Typography>
                <Typography variant="body1">Cost: {card.cost}</Typography>
                <Typography variant="body1">Attack: {card.attack}</Typography>
                <Typography variant="body1">Health: {card.health}</Typography>
              </div>
            ))}
          </div>
        </Paper>
      </div>

      <Button variant="contained" color="primary" onClick={endTurn} disabled={!isPlayerTurn}>
        End Turn
      </Button>
    </div>
  );
};

export default Game;
