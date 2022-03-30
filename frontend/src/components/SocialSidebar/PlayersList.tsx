import { Box, Heading, ListItem, OrderedList, Tooltip } from '@chakra-ui/react';
import React from 'react';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import usePlayersInTown from '../../hooks/usePlayersInTown';
import PlayerName from './PlayerName';

/**
 * Lists the current players in the town, along with the current town's name and ID
 * 
 * See relevant hooks: `usePlayersInTown` and `useCoveyAppState` 
 * 
 */
export default function PlayersInTownList(): JSX.Element {
  const players = usePlayersInTown();
  const { currentTownFriendlyName, currentTownID } = useCoveyAppState();
  const sorted = players.concat([]);
  sorted.sort((p1, p2) => p1.userName.localeCompare(p2.userName, undefined, {numeric: true, sensitivity: 'base'}));

  return (
    <Box><Tooltip label={`Town ID: ${currentTownID}`}>
      <Heading as='h2' fontSize='l'>
        Current town: {currentTownFriendlyName}
      </Heading></Tooltip>
      <OrderedList>
        {sorted.map(player => (
          <ListItem key={player.id}>
            <PlayerName player={player} />
          </ListItem>
        ))}
      </OrderedList>
    </Box>
  );
}