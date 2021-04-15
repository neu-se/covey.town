import React, {useCallback, useEffect, useState} from 'react'
import HangmanLetter from "./HangmanLetter";
import HangmanGame from "../../gamesClient/HangmanGame";

interface HangmanDisplayProps {
  game: HangmanGame;
}

export default function HangmanDisplay({game}: HangmanDisplayProps): JSX.Element {
  const [alreadyGuessedLetters, setAlreadyGuessedLetters] = useState<string[]>([])
  const [wordState, setWordState] = useState('')

  const updateAlreadyGuessedLetters = useCallback(() => {
    let letters: string[] = [];
    if (game.alreadyGuessed !== undefined) {
      letters = game.alreadyGuessed.sort();
    }
    setAlreadyGuessedLetters(letters)
  }, [])

  const guessedWord = () => {
    const word = game.finalWord.split('');
    const hiddenLetters = game.splitWord;
    const wordWithBlanks = [];
    setWordState('');
    for (let i = 0; i < word.length; i += 1) {
      if (!hiddenLetters.find(letter => word[i] === letter)) {
        wordWithBlanks.push(word[i]);
      } else {
        wordWithBlanks.push("_");
      }
    }
    setWordState(wordWithBlanks.join(' '));
  }

  useEffect(() => {
    updateAlreadyGuessedLetters();
    guessedWord();
    const timer = setInterval(updateAlreadyGuessedLetters, 500);
    return () => {
      clearInterval(timer)
    };
  }, [guessedWord, updateAlreadyGuessedLetters]);

  return (
    <>
      <div className="games-border">
        {alreadyGuessedLetters.map(letter =>
          <span key={letter}>{letter}</span>
        )}
      </div>
      <br/>
      <div>
        <h3>{wordState}</h3>
      </div>
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
