import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import React from 'react';
import useUserProfile from '../../hooks/useUserProfile';

const LogoutPopUp: React.FunctionComponent = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setUserProfile } = useUserProfile();
  const logOutUser = () => {
    setUserProfile(null);
    onClose();
  };
  return (
    <>
      <Button
        data-testid='loginMenuButton'
        style={{ float: 'right', marginLeft: '10px', marginRight: '5px' }}
        onClick={() => onOpen()}>
        Logout{' '}
      </Button>
      <Modal isOpen={isOpen} onClose={() => onClose()}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Log Out</ModalHeader>
          <ModalCloseButton />
          <form
            onSubmit={ev => {
              ev.preventDefault();
              logOutUser();
            }}>
            <ModalBody pb={6}>
              <Text>Are you sure you want to log out?</Text>
            </ModalBody>
            <ModalFooter>
              <Button type='submit'>Continue</Button>
              <Button type='button' onClick={() => onClose()}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LogoutPopUp;
