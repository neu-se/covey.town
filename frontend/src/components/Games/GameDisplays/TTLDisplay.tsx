import React, {useState} from 'react'
import {Button} from "@chakra-ui/react";
import useCoveyAppState from "../../../hooks/useCoveyAppState";
import TTLGame from "../gamesClient/TTLGame";


interface TTLProps {
  game: TTLGame
}

export default function TTLDisplay({game}: TTLProps): JSX.Element {
  const [guessing, setGuessing] = useState(true);
  const [selection, setSelection] = useState(0);
  const { gamesClient } = useCoveyAppState();

  /* Randomize array in-place using Durstenfeld shuffle algorithm */
  function shuffleArray(array: string[]): string[] {
    const newArray = array;
    for (let i = array.length - 1; i > 0; i-=1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      newArray[i] = array[j];
      newArray[j] = temp;
    }
    return newArray
  }

  const originalList = [game.option1, game.option2, game.option3]
  const lie = originalList[game.correctOption - 1]
  const choicesList = shuffleArray(originalList);
  const lieIndex = (choicesList.findIndex(choice => choice === lie) + 1)


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
              1. {choicesList[0]}
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
              2. {choicesList[1]}
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
              3. {choicesList[2]}
            </label>
          </div>
        </form>
        <br/>
        <Button className="games-padded-asset"
                colorScheme="green"
                onClick={async () => {
                  setGuessing(false);
                  await gamesClient.updateGame({gameId: game.id, move: {guess: selection.toString()}})
                }
                }>
          Guess!
        </Button>
      </>
      }

      {!guessing && selection === lieIndex &&
      <h1>You guessed correctly!</h1>
      }

      {!guessing && selection !== lieIndex &&
      <h1>{`Oops, that wasn't right. The real lie was "${choicesList[lieIndex]}".`}</h1>
      }
    </div>
  )
}
