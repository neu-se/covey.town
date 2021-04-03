import React from 'react'
import HangmanLetter from "./HangmanLetter";

export default function HangmanDisplay(): JSX.Element {
  return(
    <>
      {/* TODO: Hangman graphics go here */}
      <br/>
      <div className="games-center-div">
        <div className="row">
        <HangmanLetter letter="A"/>
        <HangmanLetter letter="B"/>
        <HangmanLetter letter="C"/>
        <HangmanLetter letter="D"/>
        <HangmanLetter letter="E"/>
        <HangmanLetter letter="F"/>
        <HangmanLetter letter="G"/>
      </div>
      <div className="row">
        <HangmanLetter letter="H"/>
        <HangmanLetter letter="I"/>
        <HangmanLetter letter="J"/>
        <HangmanLetter letter="K"/>
        <HangmanLetter letter="L"/>
        <HangmanLetter letter="M"/>
        <HangmanLetter letter="N"/>
      </div>
      <div className="row">
        <HangmanLetter letter="O"/>
        <HangmanLetter letter="P"/>
        <HangmanLetter letter="Q"/>
        <HangmanLetter letter="R"/>
        <HangmanLetter letter="S"/>
        <HangmanLetter letter="T"/>
      </div>
      <div className="row">
        <HangmanLetter letter="U"/>
        <HangmanLetter letter="V"/>
        <HangmanLetter letter="W"/>
        <HangmanLetter letter="X"/>
        <HangmanLetter letter="Y"/>
        <HangmanLetter letter="Z"/>
      </div>
      </div>
      </>
  )
}
