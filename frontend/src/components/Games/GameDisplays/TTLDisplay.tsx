import React, {useState} from 'react'
import {Button} from "@chakra-ui/react";


interface TTLProps {
  choice1: string;
  choice2: string;
  choice3: string;
  correctChoice: number;
}

export default function TTLDisplay({choice1, choice2, choice3, correctChoice}: TTLProps): JSX.Element {
  const [guessing, setGuessing] = useState(true);
  const [selection, setSelection] = useState(0);
  // TODO: assign two truths and lie to choices 1-3 in random order
  return (
    <div>
      {guessing &&
      <>
        <h1 className="games-container-title">Spot the Lie</h1>
        <p className="games-container-body">Select the statement that you think is a lie!</p>
        <br/>
        <form>
          <div className="row">
            <label htmlFor="choice1">
              <input type="radio" id="choice1"
                     className="games-padded-asset"
                     checked={selection === 1}
                     onChange={() =>
                       setSelection(
                         1
                       )}/>
              1. {choice1}
            </label>
          </div>
          <div className="row">
            <label htmlFor="choice2">
              <input type="radio" id="choice2"
                     className="games-padded-asset"
                     checked={selection === 2}
                     onChange={() =>
                       setSelection(
                         2
                       )}/>
              2. {choice2}
            </label>
          </div>
          <div className="row">
            <label htmlFor="choice3">
              <input type="radio" id="choice3"
                     className="games-padded-asset"
                     checked={selection === 3}
                     onChange={() =>
                       setSelection(
                         3
                       )}/>
              3. {choice3}
            </label>
          </div>
        </form>
        <br/>
        <Button className="games-padded-asset"
                colorScheme="green"
                onClick={() => setGuessing(false)}>
          Guess!
        </Button>
      </>
      }

      {!guessing && selection === correctChoice &&
      <h1>You guessed correctly!</h1>
      }

      {!guessing && selection !== correctChoice &&
      <h1>{`Oops, that wasn't right. The real lie was #{correctChoice}.`}</h1>
      }
    </div>
  )
}
