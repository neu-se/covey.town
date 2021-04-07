import React, { useState, useEffect } from "react";
import {
  InputGroup,
  Input,
  InputRightElement,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Box,
  Flex,
  Spacer,
} from "@chakra-ui/react";
  
import { searchUserByUserName, User } from "../../graphql/queries";

export default function FriendSearch(): JSX.Element {

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [username, setUsername] = useState("");
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  
  const handleClick = async () => {
    onOpen();
    console.log(username);
    const findUserByName = async () => {
      const userInfo = await searchUserByUserName(username);
      setUserName(userInfo.username);
      setUserEmail(userInfo.bio);
    }
    findUserByName();
    // console.log('done');
  };

  return (
    <>
      <InputGroup size='md'>
        <Input pr='4.5rem' onChange={(e) => setUsername(e.target.value)} placeholder='Search for Covey Users' />
        <InputRightElement width='4.5rem'>
          <Button h='1.75rem' colorScheme='blue' size='sm' onClick={handleClick}>
            Search{" "}
          </Button>
          <Modal onClose={onClose} isOpen={isOpen} isCentered  scrollBehavior="inside">
          <ModalOverlay />
            <ModalContent>
              <ModalHeader>Modal Title</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Box mt={5} w='90%'>
                        <Box bg="white" p={5} color="black"  borderWidth="1px" borderRadius="lg" alignItems="center">
                          <Flex>
                          {/* <Button size='md'alignItems="center"> */}
                          <Box><p>hello</p> </Box>
                          {/* </Button> */}
                          <Spacer/>
                          </Flex>
                          <Flex>
                          {/* <Button size='md'alignItems="center"> */}
                          <Box><p>hello</p> </Box>
                          {/* </Button> */}
                          <Spacer/>
                          </Flex>
                          <Flex>
                          {/* <Button size='md'alignItems="center"> */}
                          <Box><p>hello</p> </Box>
                          {/* </Button> */}
                          <Spacer/>
                          </Flex>
                        </Box>
                  </Box>
              </ModalBody>
              <ModalFooter>
                <Button onClick={onClose}>Close</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </InputRightElement>
      </InputGroup>
    </>
  );
}
