import { render, screen, within } from '@testing-library/react';
import { nanoid } from 'nanoid';
import React from 'react';
import { GameResult } from '../../../types/CoveyTownSocket';
import Leaderboard from './Leaderboard';

describe('[T4] Leaderboard', () => {
  // Spy on console.error and intercept react key warnings to fail test
  let consoleErrorSpy: jest.SpyInstance<void, [message?: any, ...optionalParms: any[]]>;
  beforeAll(() => {
    // Spy on console.error and intercept react key warnings to fail test
    consoleErrorSpy = jest.spyOn(global.console, 'error');
    consoleErrorSpy.mockImplementation((message?, ...optionalParams) => {
      const stringMessage = message as string;
      if (stringMessage.includes && stringMessage.includes('children with the same key,')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      } else if (stringMessage.includes && stringMessage.includes('warning-keys')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      }
      // eslint-disable-next-line no-console -- we are wrapping the console with a spy to find react warnings
      console.warn(message, ...optionalParams);
    });
  });
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  const winner = nanoid(); //two wins, one tie
  const middle = nanoid(); //one win, one tie, two loss
  const loser = nanoid(); //one loss
  const results: GameResult[] = [
    { gameID: nanoid(), scores: { [loser]: 0, [middle]: 1 } },
    { gameID: nanoid(), scores: { [winner]: 1, [middle]: 0 } },
    { gameID: nanoid(), scores: { [winner]: 1, [middle]: 1 } },
    { gameID: nanoid(), scores: { [winner]: 1, [middle]: 0 } },
  ];
  function checkRow(
    row: HTMLElement,
    player: string,
    wins?: number,
    losses?: number,
    ties?: number,
  ) {
    const columns = within(row).getAllByRole('gridcell');
    expect(columns).toHaveLength(4);
    expect(columns[0]).toHaveTextContent(player);
    if (wins) expect(columns[1]).toHaveTextContent(wins.toString());
    if (losses) expect(columns[2]).toHaveTextContent(losses.toString());
    if (ties) expect(columns[3]).toHaveTextContent(ties.toString());
  }
  beforeEach(() => {
    render(<Leaderboard results={results} />);
  });
  it('should render a table with the correct headers', () => {
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(4);
    expect(headers[0]).toHaveTextContent('Player');
    expect(headers[1]).toHaveTextContent('Wins');
    expect(headers[2]).toHaveTextContent('Losses');
    expect(headers[3]).toHaveTextContent('Ties');
  });
  it('should render a row for each player', () => {
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(4);
  });
  it('should render the players in order of wins', () => {
    const rows = screen.getAllByRole('row');
    checkRow(rows[1], winner);
    checkRow(rows[2], middle);
    checkRow(rows[3], loser);
  });
  it('should calculate the cumulative number of wins, losses, and ties for each player', () => {
    const rows = screen.getAllByRole('row');
    checkRow(rows[1], winner, 2, 0, 1);
    checkRow(rows[2], middle, 1, 2, 1);
    checkRow(rows[3], loser, 0, 1, 0);
  });
});
