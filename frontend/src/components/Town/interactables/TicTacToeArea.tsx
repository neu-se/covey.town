import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  chakra,
  Container,
  Heading,
  List,
  ListItem,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState, React } from 'react';
import TicTacToeAreaController, {
  TicTacToeCell,
} from '../../../classes/interactable/TicTacToeAreaController';
import PlayerController from '../../../classes/PlayerController';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import { GameResult, GameStatus, InteractableID } from '../../../types/CoveyTownSocket';
import GameAreaInteractable from './GameArea';

type TicTacToeGameProps = {
  gameAreaController: TicTacToeAreaController;
};

const StyledTicTacToeSquare = chakra(Button, {
  baseStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '33%',
    border: '1px solid black',
    height: '33%',
    fontSize: '50px',
    _disabled: {
      opacity: '100%',
    },
  },
});
const StyledTicTacToeBoard = chakra(Container, {
  baseStyle: {
    display: 'flex',
    width: '400px',
    height: '400px',
    padding: '5px',
    flexWrap: 'wrap',
  },
});

function TicTacToeGame({ gameAreaController }: TicTacToeGameProps): JSX.Element {
  const [board, setBoard] = useState<TicTacToeCell[][]>(gameAreaController.board);
  const townController = useTownController();
  const [isOurTurn, setIsOurTurn] = useState(false);
  const toast = useToast();
  useEffect(() => {
    gameAreaController.addListener('turnChanged', setIsOurTurn);
    gameAreaController.addListener('boardChanged', setBoard);
    return () => {
      gameAreaController.removeListener('boardChanged', setBoard);
      gameAreaController.removeListener('turnChanged', setIsOurTurn);
    };
  }, [gameAreaController, townController]);
  return (
    <StyledTicTacToeBoard>
      {board.map((row, rowIndex) => {
        return row.map((cell, colIndex) => {
          return (
            <StyledTicTacToeSquare
              key={`${rowIndex}.${colIndex}`}
              onClick={async () => {
                try {
                  await gameAreaController.makeMove(rowIndex, colIndex);
                } catch (e) {
                  toast({
                    title: 'Error making move',
                    description: (e as Error).toString(),
                    status: 'error',
                  });
                }
              }}
              disabled={!isOurTurn}
              aria-label={`Cell ${rowIndex},${colIndex}`}>
              {cell}
            </StyledTicTacToeSquare>
          );
        });
      })}
    </StyledTicTacToeBoard>
  );
}

function TicTacToeLeaderboard({ results }: { results: GameResult[] }): JSX.Element {
  const winsLossesTiesByPlayer: Record<string, { wins: number; losses: number; ties: number }> = {};
  results.forEach(result => {
    const players = Object.keys(result.scores);
    const p1 = players[0];
    const p2 = players[1];
    const winner =
      result.scores[p1] > result.scores[p2]
        ? p1
        : result.scores[p2] > result.scores[p1]
        ? p2
        : undefined;
    const loser =
      result.scores[p1] < result.scores[p2]
        ? p1
        : result.scores[p2] < result.scores[p1]
        ? p2
        : undefined;
    if (winner) {
      winsLossesTiesByPlayer[winner] = {
        wins: (winsLossesTiesByPlayer[winner]?.wins || 0) + 1,
        losses: winsLossesTiesByPlayer[winner]?.losses || 0,
        ties: winsLossesTiesByPlayer[winner]?.ties || 0,
      };
    }
    if (loser) {
      winsLossesTiesByPlayer[loser] = {
        wins: winsLossesTiesByPlayer[loser]?.wins || 0,
        losses: (winsLossesTiesByPlayer[loser]?.losses || 0) + 1,
        ties: winsLossesTiesByPlayer[loser]?.ties || 0,
      };
    }
    if (!winner && !loser) {
      winsLossesTiesByPlayer[p1] = {
        wins: winsLossesTiesByPlayer[p1]?.wins || 0,
        losses: winsLossesTiesByPlayer[p1]?.losses || 0,
        ties: (winsLossesTiesByPlayer[p1]?.ties || 0) + 1,
      };
      winsLossesTiesByPlayer[p2] = {
        wins: winsLossesTiesByPlayer[p2]?.wins || 0,
        losses: winsLossesTiesByPlayer[p2]?.losses || 0,
        ties: (winsLossesTiesByPlayer[p2]?.ties || 0) + 1,
      };
    }
  });
  return (
    <Table>
      <Thead>
        <Tr>
          <th>Player</th>
          <th>Wins</th>
          <th>Losses</th>
          <th>Ties</th>
        </Tr>
      </Thead>
      <Tbody>
        {Object.keys(winsLossesTiesByPlayer).map(player => {
          return (
            <Tr key={player}>
              <Td>{player}</Td>
              <Td>{winsLossesTiesByPlayer[player].wins}</Td>
              <Td>{winsLossesTiesByPlayer[player].losses}</Td>
              <Td>{winsLossesTiesByPlayer[player].ties}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}

function TicTacToeArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const gameAreaController = useInteractableAreaController<TicTacToeAreaController>(interactableID);
  const townController = useTownController();

  const [history, setHistory] = useState<GameResult[]>(gameAreaController.history);
  const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);
  const [moveCount, setMoveCount] = useState<number>(gameAreaController.moveCount);
  const [observers, setObservers] = useState<PlayerController[]>(gameAreaController.observers);
  const [joiningGame, setJoiningGame] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const updateGameState = () => {
      setHistory(gameAreaController.history);
      setGameStatus(gameAreaController.currentGame?.state.status || 'WAITING_TO_START');
      setMoveCount(gameAreaController.currentGame?.state.moves.length || 0);
      setObservers(gameAreaController.observers);
    };
    gameAreaController.addListener('gameUpdated', updateGameState);
    const onGameEnd = () => {
      console.log('game ended');
      const winner = gameAreaController.winner;
      if (!winner) {
        toast({
          title: 'Game over',
          description: 'Game ended in a tie',
          status: 'info',
        });
      } else if (winner === townController.ourPlayer) {
        toast({
          title: 'Game over',
          description: 'You won!',
          status: 'success',
        });
      } else {
        toast({
          title: 'Game over',
          description: `You lost :(`,
          status: 'error',
        });
      }
    };
    gameAreaController.addListener('gameEnd', onGameEnd);
    return () => {
      gameAreaController.removeListener('gameEnd', onGameEnd);
      gameAreaController.removeListener('gameUpdated', updateGameState);
    };
  }, [townController, gameAreaController, toast]);

  let gameStatusText = <></>;
  if (gameStatus === 'IN_PROGRESS') {
    gameStatusText = (
      <>
        Game in progress, {moveCount} moves in, currently{' '}
        {gameAreaController.whoseTurn === townController.ourPlayer
          ? 'your'
          : gameAreaController.whoseTurn?.userName + "'s"}{' '}
        turn
      </>
    );
  } else {
    let joinGameButton = <></>;
    console.log(`isPlayer=${gameAreaController.isPlayer}, over=${gameAreaController.status}`);
    if (!gameAreaController.isPlayer || gameAreaController.status === 'OVER') {
      joinGameButton = (
        <Button
          onClick={async () => {
            setJoiningGame(true);
            try {
              await gameAreaController.joinGame();
            } catch (err) {
              toast({
                title: 'Error joining game',
                description: (err as Error).toString(),
                status: 'error',
              });
            }
            setJoiningGame(false);
          }}
          isLoading={joiningGame}
          disabled={joiningGame}>
          Join New Game
        </Button>
      );
    }
    gameStatusText = (
      <b>
        Game {gameStatus === 'WAITING_TO_START' ? 'not yet started' : 'over'}. {joinGameButton}
      </b>
    );
  }

  return (
    <Container>
      <Accordion allowToggle>
        <AccordionItem>
          <Heading as='h3'>
            <AccordionButton>
              <Box as='span' flex='1' textAlign='left'>
                Leaderboard
                <AccordionIcon />
              </Box>
            </AccordionButton>
          </Heading>
          <AccordionPanel>
            <TicTacToeLeaderboard results={history} />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <Heading as='h3'>
            <AccordionButton>
              <Box as='span' flex='1' textAlign='left'>
                Current Observers
                <AccordionIcon />
              </Box>
            </AccordionButton>
          </Heading>
          <AccordionPanel>
            <List>
              {observers.map(player => {
                return <ListItem key={player.id}>{player.userName}</ListItem>;
              })}
            </List>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      {gameStatusText}
      <List>
        <ListItem>X: {gameAreaController.x?.userName || '(No player yet!)'}</ListItem>
        <ListItem>O: {gameAreaController.o?.userName || '(No player yet!)'}</ListItem>
      </List>
      <TicTacToeGame gameAreaController={gameAreaController} />
    </Container>
  );
}
export default function TicTacToeAreaWrapper(): JSX.Element {
  const gameArea = useInteractable<GameAreaInteractable>('gameArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    console.log('Ending');
    if (gameArea) {
      //TODO need to abandon the game!
      townController.interactEnd(gameArea);
      const controller = townController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [townController, gameArea]);

  if (gameArea && gameArea.getData('type') === 'TicTacToe') {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{gameArea.name}</ModalHeader>
          <ModalCloseButton />
          <TicTacToeArea interactableID={gameArea.name} />;
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
