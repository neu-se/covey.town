import React, {useState} from 'react';
import { withRouter,useHistory } from 'react-router-dom';
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



function RegisterComponent() {

    const [state , setState] = useState({
        email : "",
        password : "",
        confirmPassword: "",
        successMessage: null
    })
    const history = useHistory();

    const handleChange = (e: any) => {
        const {id , value} = e.target
        setState(prevState => ({
            ...prevState,
            [id] : value
        }))
    }

    const redirectToLogin = () => {
        history.push("/login");
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
              <Heading>Register</Heading>
            </Box>
            <Box my={4} textAlign="left">
              <form>
               
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="test@test.com"                    
                  />
                </FormControl>
                 <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    type="email"
                    placeholder="Enter your Name"
                    
               
                    
                  />
                </FormControl>
                 <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    type="email"
                    placeholder="Enter your username"
                   
                   
                    
                  />
                </FormControl>
                <FormControl isRequired mt={6}>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                     
                      placeholder="*******"
                     
                     
                    />
                   
                   
                  </InputGroup>
                </FormControl>
                <FormControl isRequired mt={6}>
                  <FormLabel>Confirm Password</FormLabel>
                  <InputGroup>
                    <Input
                     
                      placeholder="*******"
                      
                     
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
              </form>
            </Box>
          </>
       
      </Box>
    </Flex>
    )
}

export default withRouter(RegisterComponent);

