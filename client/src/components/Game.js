import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Paper, Button, Typography, Snackbar } from '@mui/material';
import { css } from '@emotion/react';

const cardStyle = css`
  border: 1px solid #000;
  padding: 8px;
  cursor: pointer;
  variant="contained";
  transition: border-color 0.3s ease-in-out, background-color 0.3s ease-in-out;
  background-color:black

  &:hover {
    border-color: red; /* Замените на нужный вам цвет */
    background-color: #eef; /* Замените на нужный вам цвет фона */
  }

  &:hover,
  &.selected {
    border-width: 2px;
  }
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
  const [hoveredCardId, setHoveredCardId] = useState(null);

  const [playerHand, setPlayerHand] = useState([]);
  const [opponentHand, setOpponentHand] = useState([]);
  const [playerDeckState, setPlayerDeckState] = useState([]);
  const [opponentDeckState, setOpponentDeckState] = useState([]);
  const [playerField, setPlayerField] = useState([]);
  const [opponentField, setOpponentField] = useState([]);
  const [maxMana, setMaxMana] = useState(2);
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
  const [opponentHandCount, setOpponentHandCount] = useState(2);
  const [hasPlayerAttacked, setHasPlayerAttacked] = useState(false);
  const [isOpponentTurn, setIsOpponentTurn] = useState(true);
  const [gameEnded, setGameEnded] = useState(false);

  const { playerDeck, opponentDeck } = useLocation().state;


  const navigate = useNavigate();

  useEffect(() => {
    if (playerHealth <= 0 || opponentHealth <= 0) {
      endGame();
    }
  }, [playerHealth, opponentHealth]);
  const endGame = () => {

    setGameEnded(true);
  };
  const handleSnackbarClose = () => {
    setGameEnded(false);
    navigate('/startgame');
  };

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
        setOpponentHandCount((prevCount) => prevCount + drawnCards.length);
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

    if (isPlayerCard && card.cost <= mana && !hasPlayerAttacked) {
      setPlayerHand(updatedHand);
      setMana(mana - card.cost);
      setPlayerField([...playerField, { ...card, hasAttacked: false }]);
      setDamageDealt(card.attack);
      setAttacker(card);
      setTarget(null);
      setHasPlayerAttacked(true);  
    } else if (!isPlayerCard && card.cost <= opponentMana) {
      setOpponentHand(updatedHand);
      setOpponentMana(opponentMana - card.cost);
      setOpponentField([...opponentField, { ...card, hasAttacked: false }]);
      setDamageReceived(card.attack);
      setAttacker(null);
      setTarget(card);
      setOpponentHandCount((prevCount) => prevCount - 1);
    }
  };

  const selectTarget = (opponentTargets) => {
    const availableTargets = opponentTargets.filter(card => card.health > 0);

    if (availableTargets.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableTargets.length);
      return availableTargets[randomIndex];
    }

    return null;
  };

  const performCreatureAttack = async () => {
    if (isPlayerTurn) {
      setIsPlayerAttacking(true);

      const newBattleLog = [];

      for (const playerCard of playerField) {
        if (!playerCard || playerCard.hasAttacked || playerCard.health <= 0) {
          continue;
        }

        let opponentCard;

        if (opponentField.length > 0) {
          const opponentCard = selectTarget(opponentField.filter(card => card.health > 0));

          if (!opponentCard) {
            break; 
          }

          const playerDamage = playerCard.attack;
          const opponentDamage = opponentCard.attack;

          const updatedPlayerField = playerField.map((card) => ({
            ...card,
            hasAttacked: card === playerCard ? true : card.hasAttacked,
            health: Math.max(0, card.health - opponentDamage),
          })).filter((card) => card.health > 0);

          setPlayerField(updatedPlayerField);

          const updatedOpponentField = [...opponentField];
          const targetIndex = updatedOpponentField.findIndex((card) => card === opponentCard);

          if (targetIndex !== -1) {
            updatedOpponentField[targetIndex].health -= playerDamage;

            if (updatedOpponentField[targetIndex].health <= 0) {
              const target = updatedOpponentField[targetIndex];
              updatedOpponentField.splice(targetIndex, 1);
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
          }

          updatedPlayerField.forEach((card) => {
            if (card === playerCard) {
              card.hasAttacked = true;
            }
          });
        } else if (!playerCard.hasAttacked) {
          setOpponentHealth((prevHealth) => Math.max(0, prevHealth - playerCard.attack));

          newBattleLog.push({
            attacker: playerCard.name,
            target: "Opponent",
            damageDealt: playerCard.attack,
            damageReceived: 0,
          });

          setPlayerField((prevField) =>
            prevField.map((card) =>
              card === playerCard ? { ...card, hasAttacked: true } : card
            )
          );
        }
      }

      setBattleLog((prevBattleLog) => [...prevBattleLog, ...newBattleLog]);
      setIsPlayerAttacking(false);
    }
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

    if (playerField.length === 0) {
      const opponentDamage = opponentField.reduce((totalDamage, card) => totalDamage + card.attack, 0);
      setPlayerHealth((prevHealth) => Math.max(0, prevHealth - opponentDamage));

      newBattleLog.push({
        attacker: "Opponent",
        target: "Player",
        damageDealt: opponentDamage,
        damageReceived: 0,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setBattleLog((prevBattleLog) => [...prevBattleLog, ...newBattleLog]);
  };

  const endTurn = async () => {
    setHasPlayerAttacked(false);

    setTurnEnded(true);
    setIsPlayerAttacking(false);
    setIsOpponentTurn(!isOpponentTurn);

    if (isOpponentTurn) {
      await handleOpponentTurn();
      setOpponentDrawn(false);
    } else {
      await drawInitialPlayerCards(1);
      setPlayerField((prevField) => prevField.map((card) => ({ ...card, hasAttacked: false })));

      performCreatureAttack();

      setMaxMana((prevMaxMana) => Math.min(prevMaxMana + 1, 10));
      setMana(Math.min(maxMana + 1, 10));
    }
    
    setBattleLog([]);
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
                <div css={containerStyle} style={{ marginLeft: '95%' }}>
  <Button
    variant="contained"
    color="primary"
    onClick={endTurn}
    className={`endTurnButton ${isPlayerTurn ? 'playerTurn' : 'opponentTurn'}`}
  >
    {isPlayerTurn ? 'End Your Turn' : 'End Opponent Turn'}
  </Button>
</div>
       <Snackbar
        open={gameEnded}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={playerHealth <= 0 ? 'You lost the game!' : 'Congratulations! You won!'}
      />
      <div css={playerInfoStyle}>
  
  
        <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px', textAlign: 'center', backgroundColor: 'rgba(139, 69, 19, 0.6)' }}>
          <Typography variant="h5">Player Hand (Mana: {mana}/{maxMana}):</Typography>
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'row', justifyContent: 'center' }}>
            {playerHand.map((card) => (
              <div
                key={card.id}
                onClick={() => isPlayerTurn && playCard(card, true)}
                onMouseEnter={() => setHoveredCardId(card.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                className={`playerCard ${hoveredCardId === card.id ? 'selected' : ''}`}
                style={{
                  ...cardStyle,
                  cursor: isPlayerTurn && card.cost <= mana ? 'pointer' : 'not-allowed',
                }}
              >
  
                <Typography variant="body1"> {card.name}</Typography>
                <Typography variant="body1">Cost: {card.cost}</Typography>
                <Typography variant="body1">Attack: {card.attack}</Typography>
                <Typography variant="body1">Health: {card.health}</Typography>
              </div>
            ))}
          </div>
        </Paper>
                <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px', textAlign: 'center',   backgroundColor:' rgba(182, 102, 210, 0.6)'}}>
                  <Typography variant="h5">Player Health: {playerHealth}</Typography>
                </Paper>
  
        <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px', textAlign: 'center', backgroundColor:'rgba(228, 75, 9,0.6)' }}>
          <Typography variant="h5">Player Field:</Typography>
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'row', justifyContent: 'center' }} className="opponentField">
            {playerField.map((card) => (
              <div
              key={card.id}
              style={{
                ...cardStyle,
              }}
              >
                <Typography variant="body1">Name: {card.name}</Typography>
                <Typography variant="body1">Attack: {card.attack}</Typography>
                <Typography variant="body1">Health: {card.health}</Typography>
              </div>
            ))}
          </div>
        </Paper>
      </div>
  
      <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px', textAlign: 'center' ,backgroundColor:'rgba(228, 75, 9,0.6)'}}>
        <Typography variant="h5">Opponent Field:</Typography>
        <div style={{ display: 'flex', gap: '8px', flexDirection: 'row', justifyContent: 'center' }}>
          {opponentField.map((card) => (
            <div
            key={card.id}
            style={{
              ...cardStyle,
            }}
            >
              <Typography variant="body1">Name: {card.name}</Typography>
              <Typography variant="body1">Attack: {card.attack}</Typography>
              <Typography variant="body1">Health: {card.health}</Typography>
            </div>
          ))}
        </div>
      </Paper>
  
      <div css={playerInfoStyle}>
        <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px', textAlign: 'center', backgroundColor:' rgba(182, 102, 210, 0.6)' }}>
          <Typography variant="h5">Opponent Health: {opponentHealth}</Typography>
        </Paper>
  
        <Paper elevation={3} style={{ padding: '16px', marginBottom: '16px', textAlign: 'center', backgroundColor: 'rgba(139, 69, 19, 0.6)' }}>
          <Typography variant="h5">Opponent Hand (Mana: {opponentMana}/{maxOpponentMana}):</Typography>
          <Typography variant="body1">Cards in Hand: {opponentHandCount}</Typography>
        </Paper>
          </div>
         
        </div>
  );
  
};

export default Game;
