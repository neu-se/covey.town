import React from "react";
import {
  Box,
  Image,
  Heading,
} from '@chakra-ui/react';


export default function StarterPage(): JSX.Element {

  return (
    <>
      <Heading color="blue.500" as="h2" size="xl" textAlign="center" paddingTop="50px">Welcome to Covey Town Network</Heading>
        <Heading as="h4" size="md" color="blue.500">Login / Signup to begin networking
  </Heading>
        <Box boxSize="xxl" paddingLeft="450px" paddingTop="6px">
        <Image borderRadius="full" src='/assets/networking.png' boxSize="600px"
    objectFit="cover" alt="Segun Adebayo"/>
      </Box>
       </>
      );
  };

   
