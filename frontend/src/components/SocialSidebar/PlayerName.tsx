import React from 'react';
import Player from "../../classes/Player"

type PlayerNameProps = {
    player: Player
}
export default function PlayerName({player} : PlayerNameProps): JSX.Element {
    return <>{player.userName}</>
}

