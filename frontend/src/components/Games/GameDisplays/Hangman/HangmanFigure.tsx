import React from 'react';
import noLimbs from './HangmanAssets/noLimbs.jpg';
import head from './HangmanAssets/head.jpg';
import back from './HangmanAssets/back.jpg';
import oneArm from './HangmanAssets/oneArm.jpg';
import twoArms from './HangmanAssets/twArms.jpg';
import oneLeg from './HangmanAssets/oneLeg.jpg';
import twoLegs from './HangmanAssets/twoLegs.jpg';

interface HangmanFigureProps {
  limbListLength: number;
}

export default function HangmanDisplay({limbListLength}: HangmanFigureProps): JSX.Element {
  const imageBasePath = "../../../../../public/assets/"
  return (
    <div>
      {
        limbListLength === 6 &&
        <img src={noLimbs} alt="gallowsOnly"/>
      }
      {
        limbListLength === 5 &&
        <img src={head} alt="headAdded"/>
      }
      {
        limbListLength === 4 &&
        <img src={back} alt="backAdded"/>
      }
      {
        limbListLength === 3 &&
        <img src={oneArm} alt="oneArmAdded"/>
      }
      {
        limbListLength === 2 &&
        <img src={twoArms} alt="twoArmsAdded"/>
      }
      {
        limbListLength === 1 &&
        <img src={oneLeg} alt="oneLegAdded"/>
      }
      {
        limbListLength === 0 &&
        <img src={twoLegs} alt="twoLegsAdded"/>
      }
    </div>
  )
}
