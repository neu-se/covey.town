import React, {useState} from "react";
import {Button} from "@chakra-ui/react";
import HangmanGame from "../../../../../../services/roomService/src/games/HangmanGame";

interface HangmanLetterProps {
  game: HangmanGame;
  letter: string
}

export default function HangmanLetter({game, letter} : HangmanLetterProps) : JSX.Element {
  const [disabled, setDisabled] = useState(false);

  return (
    <>
      {/* TODO: connect onClick to game state */}
      <Button classname="games-padded-asset"
              isDisabled={disabled}
              value={letter}
              onClick={() => {
                setDisabled(true);
                game.move({letter: letter.toLowerCase()})
              }}>
        {letter}
      </Button>
    </>
  )
}
