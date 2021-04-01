import React, {useState} from 'react'

interface TTLProps {
  choice1: string;
  choice2: string;
  choice3: string;
  correctChoice: number;
}

export default function TTLDisplay({choice1, choice2, choice3, correctChoice} : TTLProps): JSX.Element {
  const [guessing, setGuessing] = useState(true);
  return(
    <div>
      {guessing &&
        <>
          <h1 className="games-container-title">Spot the Lie</h1>
          <p className="games-container-body">Enter the number of the statement that you think is a lie!</p>
          <br/>
          <p className="games-container-body">1. {choice1}</p>
          <p className="games-container-body">2. {choice2}</p>
          <p className="games-container-body">3. {choice3}</p>
          <br/>
        </>

      }
      {!guessing &&
      //  TODO: Display should be determined by whether the player's choice was correct or not
        <h1>You guessed correctly!</h1>
      }
    </div>
  )
}
