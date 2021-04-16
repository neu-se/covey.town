import React from "react";
import { Box, Image, Heading, Flex, Center } from "@chakra-ui/react";

export default function StarterPage(): JSX.Element {
  return (
    <>
    
      <Heading
        color='blue.500'
        as='h2'
        size='xl'
        textAlign='center'
        paddingTop='50px'
      >
        Welcome to Covey Town Network
      </Heading>
      <Heading as='h4' size='md' color='blue.500'>
        Login / Signup to begin networking
      </Heading>
      <Center boxSize='xxl'>
        <Image
          borderRadius='full'
          src='/assets/networking.png'
          boxSize='70vh'
          objectFit='cover'
          alt='coveytown'
          mt= {5}
        />
      </Center>
      
    </>
  );
}
