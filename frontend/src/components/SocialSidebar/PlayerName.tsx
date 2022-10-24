import React from 'react';
import PlayerController from '../../classes/PlayerController';

type PlayerNameProps = {
  player: PlayerController;
};
export default function PlayerName({ player }: PlayerNameProps): JSX.Element {
  return <>{player.userName}</>;
}
