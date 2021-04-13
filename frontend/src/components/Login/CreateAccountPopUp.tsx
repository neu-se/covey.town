import React, { useCallback, useEffect, useState } from 'react';


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
  useDisclosure,
  useToast
} from '@chakra-ui/react';

import { IUserAccount } from '../../classes/UserAccount';
import { addUser } from '../../classes/api';

const CreateAccountPopUp: React.FunctionComponent = () => {

    const {isOpen, onOpen, onClose} = useDisclosure()
    const [newLoginUserName, setNewLoginUserName] = useState<string>('');
    const [newUserPassword, setNewUserPassword] = useState<string>('');
    const toast = useToast()
  
    const openCreateMenu = async ()=>{ onOpen(); };
  
    const closeCreateMenu = async ()=>{ onClose();  };

    const createNewUserAccount = async () =>{

      if(newLoginUserName.length === 0){
          toast({
            title: 'Unable to create new account',
            description: 'Please enter a username ',
            status: 'error',
          });
          return;
        }
      
      if (newUserPassword.length === 0) {
        toast({
          title: 'Unable to create new account',
          description: 'Please enter a password ',
          status: 'error',
        });
        return;
        }

      try {
        const newUser = {
          username: newLoginUserName,
          password: newUserPassword,
        }

        addUser(newUser);
        toast({
          title: 'User created',
          description: 'You can log in now!',
          status: 'success'
        })
        console.log("added user successfully");
      } catch (err) {
        toast({
          title: 'Unable to create account with entered info',
          description: err.toString(),
          status: 'error'
        })
    }
  }

  return <>


    <Button data-testid='createMenuButton' style={{float: 'right', marginLeft: '10px', marginRight: '5px'}} onClick={openCreateMenu}>Create Account </Button>
    <Modal isOpen={isOpen} onClose={closeCreateMenu}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Create Account</ModalHeader>
        <ModalCloseButton/>
        <form onSubmit={(ev)=>{ev.preventDefault()}}>
          <ModalBody pb={6}>
            <FormControl isRequired>
              <FormLabel htmlFor='newAccountUsername'>Enter a new username</FormLabel>
              <Input id='newAccount' placeholder="Enter New Username" name="newAccount" value={newLoginUserName} onChange={(ev)=>setNewLoginUserName(ev.target.value)} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel htmlFor='newAccountPassword'>Enter your password</FormLabel>
              <Input id='newPassword' placeholder="Enter New Password" name="newPassword" type="password" value={newUserPassword} onChange={(ev)=>setNewUserPassword(ev.target.value)} />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button data-testid='createbutton' onClick={()=> {createNewUserAccount(); closeCreateMenu() }} colorScheme="blue" mr={3} value="delete" name='create' >
              Create
            </Button>
            <Button onClick={closeCreateMenu}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>

  </>
}


export default CreateAccountPopUp;


