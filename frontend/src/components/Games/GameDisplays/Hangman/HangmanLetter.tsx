import React, {useState} from "react";
import {Button} from "@chakra-ui/react";
import useCoveyAppState from "../../../../hooks/useCoveyAppState";

interface HangmanLetterProps {
  gameId: string;
  letter: string
}

export default function HangmanLetter({gameId, letter} : HangmanLetterProps) : JSX.Element {
  const [disabled, setDisabled] = useState(false);
  const { gamesClient } = useCoveyAppState();

  return (
    <>
      <Button classname="games-padded-asset"
              isDisabled={disabled}
              value={letter}
              onClick={async () => {
                setDisabled(true);
                await gamesClient.updateGame({
                  gameId, move: {letter: letter.toLowerCase()}})
              }}>
        {letter}
      </Button>
    </>
  )
}
