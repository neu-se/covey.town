import {
Button,
FormControl,
FormLabel,
Input,
Modal,
ModalBody,
ModalCloseButton,
ModalContent,
ModalFooter,
ModalHeader,
ModalOverlay,

useToast
} from '@chakra-ui/react';
import React,{ useCallback,useState } from 'react';
import ConversationArea from '../../classes/ConversationArea';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useMaybeVideo from '../../hooks/useMaybeVideo';


type NewConversationModalProps = {
    isOpen: boolean;
    closeModal: ()=>void;
    newConversation: ConversationArea;
}
export default function NewConversationModal( {isOpen, closeModal, newConversation} : NewConversationModalProps): JSX.Element {
    const [topic, setTopic] = useState<string>('');
    const {apiClient, sessionToken, currentTownID} = useCoveyAppState();

    const toast = useToast()
    const video = useMaybeVideo()

    const createConversation = useCallback(async () => {
      if (topic) {
          const conversationToCreate = newConversation;
          conversationToCreate.topic = topic;
        try {
          await apiClient.createConversation({
            sessionToken,
            coveyTownID: currentTownID,
            conversationArea: conversationToCreate.toServerConversationArea(),
          });
          toast({
            title: 'Conversation Created!',
            status: 'success',
          });
          video?.unPauseGame();
          closeModal();
        } catch (err) {
          toast({
            title: 'Unable to create conversation',
            description: err.toString(),
            status: 'error',
          });
        }
      }
    }, [topic, apiClient, newConversation, closeModal, currentTownID, sessionToken, toast, video]);
    return (
      <Modal isOpen={isOpen} onClose={()=>{closeModal(); video?.unPauseGame()}}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a conversation in {newConversation.label} </ModalHeader>
          <ModalCloseButton />
          <form
            onSubmit={ev => {
              ev.preventDefault();
              createConversation();
            }}>
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel htmlFor='topic'>Topic of Conversation</FormLabel>
                <Input
                  id='topic'
                  placeholder='Share the topic of your conversation'
                  name='topic'
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='blue' mr={3} onClick={createConversation}>
                Create
              </Button>
              <Button onClick={closeModal}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    );
}

