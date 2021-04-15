import HangmanGame from "../../gamesClient/HangmanGame";

interface HangmanFigureProps {
  game: HangmanGame;
}

export default function HangmanDisplay({game}: HangmanFigureProps): JSX.Element {
  const imageBasePath : string = "../../../../../public/assets/"
  return (
    <>
      <img src={`${imageBasePath}`} alt=""/>
    </>
  )
}
