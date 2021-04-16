import React, {useEffect, useState} from 'react'
import {Button} from '@chakra-ui/react';
import useCoveyAppState from "../../../hooks/useCoveyAppState";
import TTLGame from "../gamesClient/TTLGame";


interface TTLProps {
  currentPlayerId: string,
  startingGame: TTLGame
}

export default function TTLDisplay({currentPlayerId, startingGame}: TTLProps): JSX.Element {
  const [guessing, setGuessing] = useState(true);
  const [selection, setSelection] = useState(0);
  const {currentTownID, gamesClient} = useCoveyAppState();
  const [currentGame, setCurrentGame] = useState<TTLGame>(startingGame);
  const gameId = startingGame.id;
  const choicesList = [currentGame.option1, currentGame.option2, currentGame.option3];


  useEffect(() => {
    const fetchGame = async () => {
      const {games} = await gamesClient.listGames({townID: currentTownID})
      const game = games.find(g => g.id === gameId)
      setCurrentGame(game as TTLGame)
    }
    fetchGame();
    const timer = setInterval(async () => {
      await fetchGame()
    }, 500)
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    }
  }, []);

  const lieIndex = (currentGame.correctOption - 1);

  return (
    <>
      {
        currentGame === undefined &&
        <div className="games-center-div">
          <br/>
          Oh no! Looks like the other player ended the game.
          <br/>
        </div>
      }
      {
        currentGame !== undefined &&
        <>
          <div>
            {
              guessing && currentPlayerId === currentGame.player2ID &&
            <>
              <h1 className="games-container-title">Spot the Lie</h1>
              <p className="games-container-body">Select the statement that you think is a lie!</p>
              <br/>
              <form>
                <div className="row">
                  <label htmlFor="choice1">
                    <input type="radio" id="choice1"
                           className="games-padded-asset"
                           checked={selection === 1}
                           onChange={() =>
                             setSelection(
                               1
                             )}/>
                    1. {currentGame.option1}
                  </label>
                </div>
                <div className="row">
                  <label htmlFor="choice2">
                    <input type="radio" id="choice2"
                           className="games-padded-asset"
                           checked={selection === 2}
                           onChange={() =>
                             setSelection(
                               2
                             )}/>
                    2. {currentGame.option2}
                  </label>
                </div>
                <div className="row">
                  <label htmlFor="choice3">
                    <input type="radio" id="choice3"
                           className="games-padded-asset"
                           checked={selection === 3}
                           onChange={() =>
                             setSelection(
                               3
                             )}/>
                    3. {currentGame.option3}
                  </label>
                </div>
              </form>
              <br/>
              <Button className="games-padded-asset"
                      colorScheme="green"
                      onClick={async () => {
                        setGuessing(false);
                        await gamesClient.updateGame({
                          townID: currentTownID,
                          gameId: startingGame.id,
                          move: {guess: selection.toString()}
                        })
                      }
                      }>
                Guess!
              </Button>
            </>
            }
            {
              guessing && currentPlayerId !== currentGame.player2ID &&
              <div className="games-center-div">
                <div className="row">
                  Player 2 is guessing!
                </div>
                <br/>
              </div>
            }

            {!guessing && selection === currentGame.correctOption &&
            <h1>{currentGame.player2Username} guessed correctly!</h1>
            }

            {!guessing && selection !== currentGame.correctOption &&
            <h1>{`Oops, that wasn't right. The real lie was "${choicesList[lieIndex]}".`}</h1>
            }
          </div>
        </>
      }
    </>
  )
}
