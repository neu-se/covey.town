import React, { useState } from 'react';
import {useHistory, withRouter} from 'react-router-dom';
import {
  Flex,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  CircularProgress,
  Text,
  InputGroup,
  InputRightElement,
  Icon
} from '@chakra-ui/react';



function LoginComponent() {

    const [state , setState] = useState({
        email : "",
        password : "",
        successMessage: null
    })

    const handleChange = (e: any) => {
        const {id , value} = e.target
        setState(prevState => ({
            ...prevState,
            [id] : value
        }))
    }

    const history = useHistory();

    const redirectToRegister = () => {
        history.push("/register");
    }



    return (
       <Flex width="full" align="center" justifyContent="center">
      <Box
         p={8}
        maxWidth="500px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        borderColor="grey"
        mt={50}

      >       
          <>
            <Box textAlign="center">
              <Heading>Login</Heading>
            </Box>
            <Box my={4} textAlign="left">
              <form>
               
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="test@test.com"
                    size="lg"
                   
                  />
                </FormControl>
                <FormControl isRequired mt={6}>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input                    
                      placeholder="*******"
                      size="lg" 
                                        
                    />                   
                  </InputGroup>
                </FormControl>
                <Button
                  variantColor="teal"
                  variant="outline"
                  type="submit"
                  width="full"
                  mt={4}
                >                                  
                    Sign In               
                </Button>
                <Text  onClick={redirectToRegister}> Do not have an account? Register </Text>
              </form>
            </Box>
          </>       
      </Box>
    </Flex>
    )
}

export default withRouter(LoginComponent);