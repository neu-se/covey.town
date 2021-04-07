import React from 'react'
import GameController from "./gamesService/GameController";
import GameModalDialog from "./GameModalDialog";

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
          <GameModalDialog dialogType="joining"
                           gameId={gameId}
                           gameType={gameType}
                           player1Username=""/>
      }{
      game !== undefined && game.player2ID !== "" &&
      <GameModalDialog dialogType="unavailable"
                       gameId={gameId}
                       gameType={gameType}
                       player1Username=""/>
    }
    </div>

  )
}
