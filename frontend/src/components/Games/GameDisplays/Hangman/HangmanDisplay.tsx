import React, {useCallback, useEffect, useState} from 'react'
import HangmanLetter from "./HangmanLetter";
import HangmanGame from "../../gamesService/HangmanGame";

interface HangmanDisplayProps {
  game: HangmanGame;
}

export default function HangmanDisplay({game}: HangmanDisplayProps): JSX.Element {
  const [alreadyGuessedLetters, setAlreadyGuessedLetters] = useState<string[]>([])

  const updateAlreadyGuessedLetters = useCallback(() => {
    const letters = game.alreadyGuessed.sort();
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
          <HangmanLetter game={game} letter="A"/>
          <HangmanLetter game={game} letter="B"/>
          <HangmanLetter game={game} letter="C"/>
          <HangmanLetter game={game} letter="D"/>
          <HangmanLetter game={game} letter="E"/>
          <HangmanLetter game={game} letter="F"/>
          <HangmanLetter game={game} letter="G"/>
        </div>
        <div className="row">
          <HangmanLetter game={game} letter="H"/>
          <HangmanLetter game={game} letter="I"/>
          <HangmanLetter game={game} letter="J"/>
          <HangmanLetter game={game} letter="K"/>
          <HangmanLetter game={game} letter="L"/>
          <HangmanLetter game={game} letter="M"/>
          <HangmanLetter game={game} letter="N"/>
        </div>
        <div className="row">
          <HangmanLetter game={game} letter="O"/>
          <HangmanLetter game={game} letter="P"/>
          <HangmanLetter game={game} letter="Q"/>
          <HangmanLetter game={game} letter="R"/>
          <HangmanLetter game={game} letter="S"/>
          <HangmanLetter game={game} letter="T"/>
        </div>
        <div className="row">
          <HangmanLetter game={game} letter="U"/>
          <HangmanLetter game={game} letter="V"/>
          <HangmanLetter game={game} letter="W"/>
          <HangmanLetter game={game} letter="X"/>
          <HangmanLetter game={game} letter="Y"/>
          <HangmanLetter game={game} letter="Z"/>
        </div>
      </div>
    </>
  )
}
