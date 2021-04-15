import HangmanGame from "../../gamesClient/HangmanGame";

interface HangmanFigureProps {
  game: HangmanGame;
}

export default function HangmanDisplay({game}: HangmanFigureProps): JSX.Element {
  const imageBasePath : string = "../../../../../public/assets/"
  return (
    <>
      {
        game.limbList.length === 6 &&
        <img src={`${imageBasePath}noLimbs.jpg`} alt="gallowsOnly"/>
      }
      {
        game.limbList.length === 5 &&
        <img src={`${imageBasePath}head.jpg`} alt="headAdded"/>
      }
      {
        game.limbList.length === 4 &&
        <img src={`${imageBasePath}back.jpg`} alt="backAdded"/>
      }
      {
        game.limbList.length === 3 &&
        <img src={`${imageBasePath}oneArm.jpg`} alt="oneArmAdded"/>
      }
      {
        game.limbList.length === 2 &&
        <img src={`${imageBasePath}twArms.jpg`} alt="twoArmsAdded"/>
      }
      {
        game.limbList.length === 1 &&
        <img src={`${imageBasePath}oneLeg.jpg`} alt="oneLegAdded"/>
      }
      {
        game.limbList.length === 6 &&
        <img src={`${imageBasePath}twoLegs.jpg`} alt="twoLegsAdded"/>
      }
    </>
  )
}
