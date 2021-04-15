import React from 'react';
import noLimbs from './HangmanAssets/noLimbs.jpg';
import head from './HangmanAssets/head.jpg';
import back from './HangmanAssets/back.jpg';
import oneArm from './HangmanAssets/oneArm.jpg';
import twoArms from './HangmanAssets/twArms.jpg';
import oneLeg from './HangmanAssets/oneLeg.jpg';
import twoLegs from './HangmanAssets/twoLegs.jpg';
import HangmanGame from "../../gamesClient/HangmanGame";

interface HangmanFigureProps {
  game: HangmanGame;
}

export default function HangmanDisplay({game}: HangmanFigureProps): JSX.Element {
  return (
    <>
      {
        game !== undefined &&
        <div>
          {
            game.limbList.length === 6 &&
            <img src={noLimbs} alt="gallowsOnly"/>
          }
          {
            game.limbList.length === 5 &&
            <img src={head} alt="headAdded"/>
          }
          {
            game.limbList.length === 4 &&
            <img src={back} alt="backAdded"/>
          }
          {
            game.limbList.length === 3 &&
            <img src={oneArm} alt="oneArmAdded"/>
          }
          {
            game.limbList.length === 2 &&
            <img src={twoArms} alt="twoArmsAdded"/>
          }
          {
            game.limbList.length === 1 &&
            <img src={oneLeg} alt="oneLegAdded"/>
          }
          {
            game.limbList.length === 0 &&
            <img src={twoLegs} alt="twoLegsAdded"/>
          }
        </div>
      }
    </>
  )
}
