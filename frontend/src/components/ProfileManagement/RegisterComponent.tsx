import React, {useState} from 'react';
import { withRouter,useHistory } from 'react-router-dom';
import * as auth0 from "auth0-js";
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
        username: "",
        confirmPassword: "",
        successMessage: null
    })
    const history = useHistory();

  const signup = () => {

    const webAuth = new auth0.WebAuth({
      domain:       'dev-fse.us.auth0.com',
      clientID:     'jgJh7ejkWNLMjNAv1oMKVtuBYsoaYcRh',
      redirectUri: 'http://localhost:3000/profile',
    });

    webAuth.signup({
      connection: 'MongoDB',
      email: state.email,
      password: state.password,
      username: "johndoe",
    }, (err) => {
      if (err) return alert(`Something went wrong: ${err}`);
      return alert('success signup without login!')
    });

  }

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
                    onChange={(e)=>{handleChange(e)}}
                  />
                </FormControl>
                 <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    type="email"
                    placeholder="Enter your Name"
                    onChange={(e)=>{handleChange(e)}}
                  />
                </FormControl>
                 <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    type="email"
                    placeholder="Enter your username"
                    onChange={(e)=>{handleChange(e)}}
                  />
                </FormControl>
                <FormControl isRequired mt={6}>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      placeholder="*******"
                      onChange={(e)=>{handleChange(e)}}
                    />
                  </InputGroup>
                </FormControl>
                <FormControl isRequired mt={6}>
                  <FormLabel>Confirm Password</FormLabel>
                  <InputGroup>
                    <Input
                      placeholder="*******"
                      onChange={(e)=>{handleChange(e)}}
                    />
                  </InputGroup>
                </FormControl>
                <Button
                  variantColor="teal"
                  variant="outline"
                  type="submit"
                  width="full"
                  mt={4}
                  onClick={()=>{signup()}}
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

