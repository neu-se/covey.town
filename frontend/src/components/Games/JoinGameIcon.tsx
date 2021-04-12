import * as  React from 'react'
import GameController from "./gamesService/GameController";
import JoinGameModalDialog from "./JoinGameModalDialog";

interface JoinGameIconProps {
  gameType: string,
  gameId: string
}

export default function JoinGameIcon({gameType, gameId}: JoinGameIconProps) : JSX.Element {
  const controller = GameController.getInstance()
  const game = controller.findGameById(gameId)
  return (
    <div>
    {/*  TODO: This needs to be a box with correct icon */}
      {
        game !== undefined && game.player2ID === "" &&
          // TODO: how to get player ID/username?
          <JoinGameModalDialog dialogType="joining"
                               gameId={gameId}
                               gameType={gameType}
                               />
      }{
      game !== undefined && game.player2ID !== "" &&
      <JoinGameModalDialog dialogType="unavailable"
                           gameId={gameId}
                           gameType={gameType}
                           />
    }
    </div>

  )
}
