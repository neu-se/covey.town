import React, { useCallback, useState } from 'react';

import {
  Box,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  useDisclosure,
  useRadioGroup,
} from '@chakra-ui/react';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import useMaybeVideo from '../../../../../../hooks/useMaybeVideo';
import useCoveyAppState from '../../../../../../hooks/useCoveyAppState';
import { MessageType } from '../../../../../../classes/TextConversation';
import usePlayersInTown from '../../../../../../hooks/usePlayersInTown';
import { CUIAutoComplete, Item } from 'chakra-ui-autocomplete';

interface SendingOptionsProps {
  messageType: MessageType;
  setMessageType: (messageType: MessageType) => void;
  receivers: string[];
  setReceivers: (playerIds: string[]) => void;
}

export default function SendingOptions({ messageType, setMessageType, receivers, setReceivers }: SendingOptionsProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const video = useMaybeVideo()
  const { currentTownFriendlyName } = useCoveyAppState();
  // other player joins in / leaves
  // should know if I am in a conversation area
  const players = usePlayersInTown()
  const { myPlayerID } = useCoveyAppState()
  const globalOption: Item = { value: MessageType.GLOBAL_MESSAGE, label: 'Global' }
  const groupOption: Item = { value: MessageType.GROUP_MESSAGE, label: 'Group' }
  const options: Item[] = [globalOption, groupOption]
  players.filter(player => player.id != myPlayerID).forEach(player => {
    options.push({ value: player.id, label: player.userName })
  })
  const [optionItems, setOptionItems] = useState(options)
  const [selectedItem, setSelectedItem] = useState(globalOption)

  const openSettings = useCallback(() => {
    onOpen();
    video?.pauseGame();
  }, [onOpen, video]);

  const closeSettings = useCallback(() => {
    onClose();
    video?.unPauseGame();
  }, [onClose, video]);

  const onChange = (event: string) => {
    if (event === MessageType.GLOBAL_MESSAGE) {
      setMessageType(MessageType.GLOBAL_MESSAGE);
      setReceivers([])
    } else if (event === MessageType.GROUP_MESSAGE) {
      setMessageType(MessageType.GROUP_MESSAGE)
      setReceivers([])
    } else {
      setMessageType(MessageType.DIRECT_MESSAGE)
      setReceivers([event, myPlayerID])
    }
    console.log(event)
  }


  return <>
    <MenuItem data-testid='openMenuButton' onClick={openSettings}>
      <Typography variant="body1">
        {messageType === MessageType.GLOBAL_MESSAGE
          ? 'To Town'
          : messageType === MessageType.GROUP_MESSAGE
            ? 'To Conversation Area'
            : 'To ' + players.find(player => player.id === receivers[0])?.userName
        }
      </Typography>
    </MenuItem>
    <Modal isOpen={isOpen} onClose={closeSettings}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Sending Settings</ModalHeader>
        <ModalCloseButton />
        <Box px={8} py={4}>
          <CUIAutoComplete
            label={'Current Option: ' + selectedItem.label}
            placeholder='Search for a Sending Option'
            items={optionItems}
            disableCreateItem
            tagStyleProps={{
              display: "none"
            }}
            selectedItems={[selectedItem]}
            onSelectedItemsChange={(change) => {
              if (change.selectedItems && change.selectedItems[0] !== change.selectedItems[1]) {
                setSelectedItem(change.selectedItems[1])
                onChange(change.selectedItems[1].value)
              }
              closeSettings()
            }}
          />
        </Box>
      </ModalContent>
    </Modal>
  </>
}