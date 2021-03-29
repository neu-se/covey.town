import React, { useState } from 'react';
import {withRouter} from "react-router-dom";
import {
    Flex,
    Heading,
} from '@chakra-ui/react';


function HeaderComponent() {

    const [state , setState] = useState({
        email : "",
        password : "",
        successMessage: null
    })


    return (
          <Flex
      as="nav"
      align="center"
      
      wrap="wrap"
      padding="0.5rem"
      backgroundColor="#1E90FF"
      color="white"
      
      
    >
      <Flex align="center" mr={5}>
        <Heading as="h4" size="lg" letterSpacing="-.1rem">
          Covey Town
        </Heading>
      </Flex>
      </Flex>
    )
}

export default withRouter(HeaderComponent);

