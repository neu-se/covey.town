import { Button, Container, Heading, List, ListItem, Modal, ModalContent, ModalOverlay, Table, Tbody, useToast } from "@chakra-ui/react";
import { update } from "lodash";
import { useEffect, useState } from "react";
import TicTacToeAreaController, { TicTacToeCell } from "../../../classes/interactable/TicTacToeAreaController";
import PlayerController from "../../../classes/PlayerController";
import { useInteractable, useInteractableAreaController } from "../../../classes/TownController";
import useTownController from "../../../hooks/useTownController";
import { GameArea, GameResult, GameState, GameStatus, InteractableID, TicTacToeGameState } from "../../../types/CoveyTownSocket";
import GameAreaInteractable from './GameArea';

type TicTacToeGameProps = {
    gameAreaController: TicTacToeAreaController;
}

function TicTacToeGame({ gameAreaController }: TicTacToeGameProps): JSX.Element {
    const [board, setBoard] = useState<TicTacToeCell[][]>(gameAreaController.board);
    const townController = useTownController();
    const [isOurTurn, setIsOurTurn] = useState(false);
    const toast = useToast();
    useEffect(() => {
        gameAreaController.addListener('turnChanged', setIsOurTurn)
        gameAreaController.addListener('boardChanged', setBoard);
        return () => {
            gameAreaController.removeListener('boardChanged', setBoard);
            gameAreaController.removeListener('turnChanged', setIsOurTurn)

        }
    }, [gameAreaController, townController]);
    return <Table>
        <Tbody aria-label="Tic Tac Toe Board">
        {board.map((row, rowIndex) => {
            return <tr key={rowIndex}>
                {row.map((cell, colIndex) => {
                    return <td key={colIndex}>
                        <Button onClick={async () => {
                            try {
                                await gameAreaController.makeMove(rowIndex, colIndex)
                            } catch (e) {
                                toast({
                                    title: "Error making move",
                                    description: (e as Error).toString(),
                                    status: "error",
                                })
                            }
                        }}
                        disabled={!isOurTurn}
                        aria-label={`Cell ${rowIndex},${colIndex}`}
                        >
                            {cell}
                        </Button>
                    </td>
                })}
            </tr>
        })}
        </Tbody>
    </Table>
}

function ScoreboardEntry({ entry }: { entry: GameResult }): JSX.Element {
    const players = Object.keys(entry.scores);
    const p1 = players[0];
    const p2 = players[1];
    const winner = entry.scores[p1] > entry.scores[p2] ? p1 :
        entry.scores[p2] > entry.scores[p1] ? p2 : undefined;
    const loser = entry.scores[p1] < entry.scores[p2] ? p1 :
        entry.scores[p2] < entry.scores[p1] ? p2 : undefined;

    if (winner) {
        return <>{winner} beat {loser} </>
    }
    else {
        return <>{p1} and {p2} tied</>
    }
}
function TicTacToeArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
    const gameAreaController = useInteractableAreaController<TicTacToeAreaController>(interactableID);
    const townController = useTownController();

    const [history, setHistory] = useState<GameResult[]>(gameAreaController.history);
    const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);
    const [moveCount, setMoveCount] = useState<number>(gameAreaController.moveCount);
    const [observers, setObservers] = useState<PlayerController[]>(gameAreaController.occupants);
    const [joiningGame, setJoiningGame] = useState(false);
    // const [canJoinGame, setCanJoinGame] = useState(gameAreaController.canJoinGame);
    const toast = useToast();

    useEffect(() => {
        const updateGameState = () => {
            setHistory(gameAreaController.history);
            setGameStatus(gameAreaController.currentGame?.state.status || 'WAITING_TO_START');
            setMoveCount(gameAreaController.currentGame?.state.moves.length || 0);
            // setCanJoinGame(gameAreaController.canJoinGame);
        };
        gameAreaController.addListener('gameUpdated', updateGameState);
        const updateObservers = (newOccupants: PlayerController[]) => {
            setObservers(newOccupants.filter((player) => !gameAreaController.players.includes(player)));
        }
        const updatePlayers = (newPlayers: PlayerController[]) => {
            updateObservers(gameAreaController.occupants);
        };
        const onGameEnd = ()=>{
            console.log('game ended')
            const winner = gameAreaController.winner;
            if(!winner){
                toast({
                    title: "Game over",
                    description: "Game ended in a tie",
                    status: "info",
                })
            } else if(winner === townController.ourPlayer){
                toast({
                    title: "Game over",
                    description: "You won!",
                    status: "success",
                })
            } else {
                toast({
                    title: "Game over",
                    description: `You lost :(`,
                    status: "error",
                })
            }
        }
        gameAreaController.addListener('gameEnd', onGameEnd);
        gameAreaController.addListener('playersChange', updatePlayers);
        gameAreaController.addListener('occupantsChange', updateObservers);
        return () => {
            gameAreaController.removeListener('gameEnd', onGameEnd);
            gameAreaController.removeListener('playersChange', updatePlayers);
            gameAreaController.removeListener('gameUpdated', updateGameState);
            gameAreaController.removeListener('occupantsChange', updateObservers);
        }
    }, [townController, gameAreaController]);


    let gameStatusText = <></>;
    if (gameStatus === 'IN_PROGRESS') {
        gameStatusText = <>Game in progress, {moveCount} moves in, currently {gameAreaController.whoseTurn?.userName}'s turn</>
    } else {
        let joinGameButton = <></>;
        console.log(`isPlayer=${gameAreaController.isPlayer}, over=${gameAreaController.status}`)
        if (!gameAreaController.isPlayer || gameAreaController.status === 'OVER') {
            joinGameButton = <Button onClick={async () => {
                setJoiningGame(true);
                try {
                    await gameAreaController.joinGame()
                } catch (err) {
                    toast({
                        title: "Error joining game",
                        description: (err as Error).toString(),
                        status: "error",
                    })
                }
                setJoiningGame(false);
            }}
                isLoading={joiningGame}
                disabled={joiningGame}
            >Join New Game</Button>
        }
        gameStatusText = <>Game {gameStatus === 'WAITING_TO_START' ? 'not yet started' : 'over'}. {joinGameButton}</>
    }

    return <Modal isOpen={true} onClose={() => { }}>
        <ModalOverlay />
        <ModalContent>
            <Container>
                <Heading as="h2">{gameAreaController.id}</Heading>
                <Heading as="h3">Players</Heading>
                <List>
                    <ListItem>X: {gameAreaController.x?.userName || '(No player yet!)'}</ListItem>
                    <ListItem>O: {gameAreaController.o?.userName || '(No player yet!)'}</ListItem>
                </List>
                <Heading as="h3">Observers</Heading>
                <List>
                    {observers.map((player) => {
                        return <ListItem key={player.id}>{player.userName}</ListItem>
                    })}
                </List>
                 <Heading as="h3">History</Heading>
                <List>
                    {history.map((result) => <ListItem key={result.gameID}><ScoreboardEntry entry={result} /></ListItem>)}
                </List>
                <Heading as="h3">Game</Heading>
                {gameStatusText}
                <TicTacToeGame gameAreaController={gameAreaController} />
            </Container>
        </ModalContent>
    </Modal>;
}
export default function TicTacToeAreaWrapper(): JSX.Element {
    const gameArea = useInteractable<GameAreaInteractable>('gameArea');
    if (gameArea && gameArea.getData('type') === 'TicTacToe') {
        return <TicTacToeArea interactableID={gameArea.name} />;
    }
    return <></>;
}