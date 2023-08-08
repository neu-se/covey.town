import { Box, Heading, ListItem, UnorderedList } from '@chakra-ui/react';
import React from 'react';
import ConversationAreaController, {
  useConversationAreaTopic,
} from '../../classes/interactable/ConversationAreaController';
import { useInteractableAreaOccupants } from '../../classes/interactable/InteractableAreaController';
import { useActiveConversationAreas } from '../../classes/TownController';
import PlayerName from './PlayerName';

type ConversationAreaViewProps = {
  area: ConversationAreaController;
};

/**
 * Displays a list of "active" conversation areas, along with their occupants
 *
 * A conversation area is "active" if its topic is not set to the constant NO_TOPIC_STRING that is exported from the ConverationArea file
 *
 * If there are active areas, it sorts them by label ascending
 *
 * See relevant hooks: useConversationAreas, usePlayersInTown.
 */
function ConversationAreaView({ area }: ConversationAreaViewProps): JSX.Element {
  const occupants = useInteractableAreaOccupants(area);
  const topic = useConversationAreaTopic(area);

  return (
    <Box>
      <Heading as='h3' fontSize='m'>
        {area.id}: {topic}
      </Heading>
      <UnorderedList>
        {occupants.map(occupant => {
          return (
            <ListItem key={occupant.id}>
              <PlayerName player={occupant} />
            </ListItem>
          );
        })}
      </UnorderedList>
    </Box>
  );
}
export default function ConversationAreasList(): JSX.Element {
  const activeConversationAreas = useActiveConversationAreas();
  return (
    <Box>
      <Heading as='h2' fontSize='l'>
        Active Conversation Areas:
      </Heading>
      {activeConversationAreas.length === 0 ? (
        <>No active conversation areas</>
      ) : (
        activeConversationAreas
          .sort((a1, a2) =>
            a1.id.localeCompare(a2.id, undefined, { numeric: true, sensitivity: 'base' }),
          )
          .map(area => <ConversationAreaView area={area} key={area.id} />)
      )}
    </Box>
  );
}
