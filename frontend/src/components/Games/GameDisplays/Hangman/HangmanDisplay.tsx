import React, {useCallback, useEffect, useState} from 'react'
import HangmanLetter from "./HangmanLetter";
import HangmanGame from "../../gamesClient/HangmanGame";

interface HangmanDisplayProps {
  game: HangmanGame;
}

export default function HangmanDisplay({game}: HangmanDisplayProps): JSX.Element {
  const [alreadyGuessedLetters, setAlreadyGuessedLetters] = useState<string[]>([])

  const updateAlreadyGuessedLetters = useCallback(() => {
    let letters: string[] = [];
    if (game.alreadyGuessed !== undefined) {
      letters = game.alreadyGuessed.sort();
    }
    setAlreadyGuessedLetters(letters)
  }, [])

  useEffect(() => {
    updateAlreadyGuessedLetters();
    const timer = setInterval(updateAlreadyGuessedLetters, 500);
    return () => {
      clearInterval(timer)
    };
  }, [updateAlreadyGuessedLetters]);

  return (
    <>
      <div className="games-border">
        {alreadyGuessedLetters.map(letter =>
          <span key={letter}>{letter}</span>
        )}
      </div>
      {/* TODO: Hangman graphics go here */}
      <br/>
      <div className="games-center-div">
        <div className="row">
          <HangmanLetter gameId={game.id} letter="A"/>
          <HangmanLetter gameId={game.id} letter="B"/>
          <HangmanLetter gameId={game.id} letter="C"/>
          <HangmanLetter gameId={game.id} letter="D"/>
          <HangmanLetter gameId={game.id} letter="E"/>
          <HangmanLetter gameId={game.id} letter="F"/>
          <HangmanLetter gameId={game.id} letter="G"/>
        </div>
        <div className="row">
          <HangmanLetter gameId={game.id} letter="H"/>
          <HangmanLetter gameId={game.id} letter="I"/>
          <HangmanLetter gameId={game.id} letter="J"/>
          <HangmanLetter gameId={game.id} letter="K"/>
          <HangmanLetter gameId={game.id} letter="L"/>
          <HangmanLetter gameId={game.id} letter="M"/>
          <HangmanLetter gameId={game.id} letter="N"/>
        </div>
        <div className="row">
          <HangmanLetter gameId={game.id} letter="O"/>
          <HangmanLetter gameId={game.id} letter="P"/>
          <HangmanLetter gameId={game.id} letter="Q"/>
          <HangmanLetter gameId={game.id} letter="R"/>
          <HangmanLetter gameId={game.id} letter="S"/>
          <HangmanLetter gameId={game.id} letter="T"/>
        </div>
        <div className="row">
          <HangmanLetter gameId={game.id} letter="U"/>
          <HangmanLetter gameId={game.id} letter="V"/>
          <HangmanLetter gameId={game.id} letter="W"/>
          <HangmanLetter gameId={game.id} letter="X"/>
          <HangmanLetter gameId={game.id} letter="Y"/>
          <HangmanLetter gameId={game.id} letter="Z"/>
        </div>
      </div>
    </>
  )
}
