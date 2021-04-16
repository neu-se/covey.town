import React, {useEffect, useState} from 'react'
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
  const [gameId, setGameId] = useState<string>("");
  const [finalWord, setFinalWord] = useState<string[]>([]);
  const [playing, setPlaying] = useState(true);
  const [winner, setWinner] = useState(0);

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
      const game = games.find(g => g.id === startingGame.id)
      setCurrentGame(game as HangmanGame)
      setGameId(game? game.id : "");
      setFinalWord( currentGame ? currentGame.finalWord.split("") : [])
    }
    fetchGame();
    const timer = setInterval(async () => {
      await fetchGame();
    }, 500)
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    }
  }, [currentTownID, gameId, gamesClient]);

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
            <div className="games-border games-padded-asset">
              Already guessed:
              {updateAlreadyGuessedLetters().map(letter =>
                <span key={letter}>{finalWord.includes(letter) ? "" : ` ${letter} `}</span>
              )}
            </div>
            <HangmanFigure game={currentGame}/>
            <br/>
            <div className="games-center-div">
              <h3>{finalWord.map(letter =>
                <span key={letter}>{updateAlreadyGuessedLetters().includes(letter) ? `${letter} ` : "_ "}</span>
              )}</h3>
            </div>
            <br/>
            {
              currentPlayerId !== currentGame.player2ID && currentGame.splitWord.length !== 0 && currentGame.limbList.length !== 0 &&
              <div className="games-center-div">
                <div className="row games-wait-message">
                  Player 2 is guessing!
                </div>
                <br/>
              </div>
              }
            {
              currentGame.limbList.length === 0 &&
              <>
                <div className="games-center-div games-end-message">
                  <br/>
                  <h1>Game is over! {currentGame.player1Username} won!</h1>
                  <br/>
                </div>
              </>
            }
            {
              currentGame.splitWord.length === 0 &&
              <>
                <div className="games-center-div games-end-message">
                  <br/>
                  <h1>Game is over! {currentGame.player2Username} won!</h1>
                  <br/>
                </div>
              </>
            }
            {
              currentPlayerId === currentGame.player2ID && currentGame.splitWord.length !== 0 && currentGame.limbList.length !== 0 &&
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
