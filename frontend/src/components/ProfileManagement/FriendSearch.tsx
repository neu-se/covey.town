import React from "react";
import {
  Box,
  Image,
  Heading,
  InputGroup,
  Input,
  InputRightElement,
  Button
} from '@chakra-ui/react';


export default function FriendSearch(): JSX.Element {

  return (
    <>
      <InputGroup size="md">
      <Input
        pr="4.5rem"
        placeholder="Search for Covey Users"
      />
      <InputRightElement width="4.5rem">
        <Button h="1.75rem" colorScheme="blue" size="sm">
        Search </Button>
      </InputRightElement>
    </InputGroup>
       </>
      );
  };

   
