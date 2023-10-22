import { Table, Tbody, Td, Thead, Tr } from '@chakra-ui/react';
import React from 'react';
import { GameResult } from '../../../types/CoveyTownSocket';

/**
 * A component that renders a list of GameResult's as a leaderboard, formatted as a table with the following columns:
 * - Player: the name of the player
 * - Wins: the number of games the player has won
 * - Losses: the number of games the player has lost
 * - Ties: the number of games the player has tied
 * Each column has a header (a table header `th` element) with the name of the column.
 *
 *
 * The table is sorted by the number of wins, with the player with the most wins at the top.
 *
 * @returns
 */
export default function Leaderboard({ results }: { results: GameResult[] }): JSX.Element {
  const winsLossesTiesByPlayer: Record<
    string,
    { player: string; wins: number; losses: number; ties: number }
  > = {};
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
        player: winner,
        wins: (winsLossesTiesByPlayer[winner]?.wins || 0) + 1,
        losses: winsLossesTiesByPlayer[winner]?.losses || 0,
        ties: winsLossesTiesByPlayer[winner]?.ties || 0,
      };
    }
    if (loser) {
      winsLossesTiesByPlayer[loser] = {
        player: loser,
        wins: winsLossesTiesByPlayer[loser]?.wins || 0,
        losses: (winsLossesTiesByPlayer[loser]?.losses || 0) + 1,
        ties: winsLossesTiesByPlayer[loser]?.ties || 0,
      };
    }
    if (!winner && !loser) {
      winsLossesTiesByPlayer[p1] = {
        player: p1,
        wins: winsLossesTiesByPlayer[p1]?.wins || 0,
        losses: winsLossesTiesByPlayer[p1]?.losses || 0,
        ties: (winsLossesTiesByPlayer[p1]?.ties || 0) + 1,
      };
      winsLossesTiesByPlayer[p2] = {
        player: p2,
        wins: winsLossesTiesByPlayer[p2]?.wins || 0,
        losses: winsLossesTiesByPlayer[p2]?.losses || 0,
        ties: (winsLossesTiesByPlayer[p2]?.ties || 0) + 1,
      };
    }
  });
  const rows = Object.keys(winsLossesTiesByPlayer).map(player => winsLossesTiesByPlayer[player]);
  rows.sort((a, b) => b.wins - a.wins);
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
        {rows.map(record => {
          return (
            <Tr key={record.player}>
              <Td>{record.player}</Td>
              <Td>{record.wins}</Td>
              <Td>{record.losses}</Td>
              <Td>{record.ties}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}
