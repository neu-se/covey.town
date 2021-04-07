import React, {useState} from "react";
import {Button} from "@chakra-ui/react";

interface TicTacToeBoxProps {
  boxId: string
}

export default function TicTacToeBox({boxId} : TicTacToeBoxProps): JSX.Element {
  const [value, setValue] = useState("");
  return (
    <>
      { /* TODO: determine whether button changes to X or O programmatically */ }
      <Button id={boxId} className="games-padded-asset" onClick={() => setValue("X")}>{value}</Button>
    </>
  )
}
