import React, {useState} from 'react'
import {Button} from "@chakra-ui/react";

export default function TicTacToeDisplay(): JSX.Element {
  const [value1A, setValue1A] = useState("");
  const [value1B, setValue1B] = useState("");
  const [value1C, setValue1C] = useState("");

  const [value2A, setValue2A] = useState("");
  const [value2B, setValue2B] = useState("");
  const [value2C, setValue2C] = useState("");

  const [value3A, setValue3A] = useState("");
  const [value3B, setValue3B] = useState("");
  const [value3C, setValue3C] = useState("");

  return(
    <>
      <br/>
      <div className="games-center-div">
        <div className="row">
          { /* TODO: determine whether button changes to X or O programmatically */ }
          <Button id="1A" className="games-padded-asset" onClick={() => setValue1A("X")}>{value1A}</Button>
          <Button id="1B" className="games-padded-asset" onClick={() => setValue1B("X")}>{value1B}</Button>
          <Button id="1C" className="games-padded-asset" onClick={() => setValue1C("X")}>{value1C}</Button>
        </div>
        <div className="row">
          <Button id="2A" className="games-padded-asset" onClick={() => setValue2A("X")}>{value2A}</Button>
          <Button id="2B" className="games-padded-asset" onClick={() => setValue2B("X")}>{value2B}</Button>
          <Button id="2C" className="games-padded-asset" onClick={() => setValue2C("X")}>{value2C}</Button>
        </div>
        <div className="row">
          <Button id="3A" className="games-padded-asset" onClick={() => setValue3A("X")}>{value3A}</Button>
          <Button id="3B" className="games-padded-asset" onClick={() => setValue3B("X")}>{value3B}</Button>
          <Button id="3C" className="games-padded-asset" onClick={() => setValue3C("X")}>{value3C}</Button>
        </div>
      </div>
      <br/>
      </>
  )
}
