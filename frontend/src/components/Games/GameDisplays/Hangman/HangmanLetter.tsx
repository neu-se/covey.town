import React, {useState} from "react";
import {Button} from "@chakra-ui/react";

interface HangmanLetterProps {
  letter: string
}

export default function HangmanLetter({letter} : HangmanLetterProps) : JSX.Element {
  const [disabled, setDisabled] = useState(false);

  return (
    <>
      <Button classname="games-padded-asset"
              isDisabled={disabled}
              onClick={() => setDisabled(true)}>
        {letter}
      </Button>
    </>
  )
}
