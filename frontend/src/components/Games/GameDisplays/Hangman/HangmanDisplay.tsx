import React, {useCallback, useEffect, useState} from 'react'
import HangmanLetter from "./HangmanLetter";
import HangmanGame from "../../gamesClient/HangmanGame";
import HangmanFigure from './HangmanFigure';
import useCoveyAppState from "../../../../hooks/useCoveyAppState";

interface HangmanDisplayProps {
  startingGame: HangmanGame,
  currentPlayerId: string,
}


export default function HangmanDisplay({currentPlayerId, startingGame}: HangmanDisplayProps): JSX.Element {
  const {gamesClient, currentTownID} = useCoveyAppState();
  const [currentGame, setCurrentGame] = useState<HangmanGame>(startingGame);
  const gameId = startingGame.id;
  const [wordState, setWordState] = useState('')
  const finalWord = startingGame.finalWord.split('')

  const updateAlreadyGuessedLetters = () => {
    let letters: string[] = [];
    if (currentGame !== undefined && currentGame.alreadyGuessed !== undefined) {
      letters = currentGame.alreadyGuessed.sort();
    }
    return letters;
  }


  useEffect(() => {
    const fetchGame = async () => {
      const {games} = await gamesClient.listGames({townID: currentTownID})
      const game = games.find(g => g.id === gameId)
      setCurrentGame(game as HangmanGame)
    }
    fetchGame();
    // guessedWord();
    const timer = setInterval(async () => {
      await fetchGame();
      // await guessedWord();
    }, 500)
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    }
  }, []);

  return (
    <>
      {
        currentGame === undefined &&
          <div className="games-center-div">
            <br/>
            Oh no! Looks like Player 1 ended the game.
            <br/>          </div>
      }
      {
        currentGame !== undefined &&
          <>
            <div className="games-border">
              {updateAlreadyGuessedLetters().map(letter =>
                <span key={letter}>{finalWord.includes(letter) ? "" : letter}</span>
              )}
            </div>
            <HangmanFigure game={currentGame}/>
            <br/>
            <div className="games-center-div">
              <h3>{finalWord.map(letter =>
                <span key={letter}>{updateAlreadyGuessedLetters().includes(letter) ? letter : "_ "}</span>
              )}</h3>
            </div>
            <br/>
            {
              currentPlayerId !== currentGame.player2ID &&
              <div className="games-center-div">
                <div className="row">
                  Player 2 is guessing!
                </div>
                <br/>
              </div>
              }
            {
              currentPlayerId === currentGame.player2ID &&
                <>
                  <div className="games-center-div">
                    <div className="row">
                      <HangmanLetter gameId={gameId} letter="A"/>
                      <HangmanLetter gameId={gameId} letter="B"/>
                      <HangmanLetter gameId={gameId} letter="C"/>
                      <HangmanLetter gameId={gameId} letter="D"/>
                      <HangmanLetter gameId={gameId} letter="E"/>
                      <HangmanLetter gameId={gameId} letter="F"/>
                      <HangmanLetter gameId={gameId} letter="G"/>
                    </div>
                    <div className="row">
                      <HangmanLetter gameId={gameId} letter="H"/>
                      <HangmanLetter gameId={gameId} letter="I"/>
                      <HangmanLetter gameId={gameId} letter="J"/>
                      <HangmanLetter gameId={gameId} letter="K"/>
                      <HangmanLetter gameId={gameId} letter="L"/>
                      <HangmanLetter gameId={gameId} letter="M"/>
                      <HangmanLetter gameId={gameId} letter="N"/>
                    </div>
                    <div className="row">
                      <HangmanLetter gameId={gameId} letter="O"/>
                      <HangmanLetter gameId={gameId} letter="P"/>
                      <HangmanLetter gameId={gameId} letter="Q"/>
                      <HangmanLetter gameId={gameId} letter="R"/>
                      <HangmanLetter gameId={gameId} letter="S"/>
                      <HangmanLetter gameId={gameId} letter="T"/>
                    </div>
                    <div className="row">
                      <HangmanLetter gameId={gameId} letter="U"/>
                      <HangmanLetter gameId={gameId} letter="V"/>
                      <HangmanLetter gameId={gameId} letter="W"/>
                      <HangmanLetter gameId={gameId} letter="X"/>
                      <HangmanLetter gameId={gameId} letter="Y"/>
                      <HangmanLetter gameId={gameId} letter="Z"/>
                    </div>
                  </div>
                </>
            }
          </>
      }
    </>
  )
}
