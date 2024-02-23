import { Box, Heading, ListItem, OrderedList, UnorderedList } from '@chakra-ui/react';
import {
  GenericInteractableAreaController,
  useInteractableAreaFriendlyName,
  useInteractableAreaOccupants,
} from '../../classes/interactable/InteractableAreaController';
import { useActiveInteractableAreas } from '../../classes/TownController';
import PlayerName from './PlayerName';
import React from 'react';

type InteractableAreViewProps = {
  area: GenericInteractableAreaController;
};

function InteractableAreaView({ area }: InteractableAreViewProps): JSX.Element {
  const occupants = useInteractableAreaOccupants(area);
  const friendlyName = useInteractableAreaFriendlyName(area);
  return (
    <Box>
      <Heading as='h4' fontSize='m'>
        {friendlyName}
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

/**
 * A react component that displays a list of all active interactable areas in the town.
 * The list is grouped by type of interactable area, with those groups sorted alphabetically
 * by the type name. If there are any active areas of that type, the type name is shown in an H3,
 * followed by an ordered list of interactable areas of that type. Within each type, the areas
 * are sorted first by the number of occupants in the area, and then by the name of the area
 * (alphanumerically).
 *
 * The list of interactable areas is represented as an ordered list, with each list item
 * containing the name of the area (in an H4 heading), and then a list of the occupants of the area, where
 * each occupant is shown as a PlayerName component. The list of occupants is in an unordered list.
 *
 * @returns A list of all active interactable areas in the town as per above spec
 */
export default function InteractableAreasList(): JSX.Element {
  const interactableAreas = useActiveInteractableAreas();

  const areasByType = new Map<string, GenericInteractableAreaController[]>();
  interactableAreas.forEach(area => {
    const areas = areasByType.get(area.type) ?? [];
    areas.push(area);
    areasByType.set(area.type, areas);
  });
  //TODO: Known bug - when the occupancy of a room changes, the list order does not update
  //useActiveInteractableAreasSortedByOccupancy() would be a better hook to use here, but
  //the test suite does not currently support it - it would need to do different mocking.

  const interactableAreaSorter = (
    a: GenericInteractableAreaController,
    b: GenericInteractableAreaController,
  ) => {
    if (a.occupants.length === b.occupants.length)
      return a.friendlyName.localeCompare(b.friendlyName, undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    return b.occupants.length - a.occupants.length;
  };

  const types = Array.from(areasByType.keys()).sort();

  return (
    <Box>
      <Heading as='h2' fontSize='l'>
        Active Areas:
      </Heading>
      {interactableAreas.length === 0 ? (
        <>No active areas</>
      ) : (
        types.map(type => {
          const areas = areasByType.get(type)?.sort(interactableAreaSorter);
          if (!areas) {
            return <div key={type}></div>;
          }
          return (
            <Box key={type}>
              <Heading as='h3' fontSize='m'>
                {type}s
              </Heading>
              <OrderedList>
                {areas.map(area => (
                  <ListItem key={area.id}>
                    <InteractableAreaView area={area} key={area.id} />
                  </ListItem>
                ))}
              </OrderedList>
            </Box>
          );
        })
      )}
    </Box>
  );
}
