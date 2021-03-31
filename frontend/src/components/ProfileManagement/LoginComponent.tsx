import React, { useState } from 'react';
import * as auth0 from "auth0-js";
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

  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");



    const history = useHistory();

    const redirectToRegister = () => {
        history.push("/register");
    }


    const handleLogin = () => {

      const webAuth = new auth0.WebAuth({
        domain:       'dev-fse.us.auth0.com',
        clientID:     'jgJh7ejkWNLMjNAv1oMKVtuBYsoaYcRh',
        redirectUri: 'http://localhost:3000/',
      });

      console.log(email);
      console.log(password);

      webAuth.login({
        email,
        password,
        realm: "MongoDB",
        responseType: 'token id_token'
      }, (err) => {
        if (err) console.log(`incorrect: ${err}`);
        console.log('success!')
      });
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
                    defaultValue={email}
                    onChange={(e)=>{setEmail(e.target.value)}}
                  />
                </FormControl>
                <FormControl isRequired mt={6}>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      placeholder="*******"
                      size="lg"
                      defaultValue={password}
                      onChange={(e)=>{setPassword(e.target.value)}}
                    />
                  </InputGroup>
                </FormControl>
                <Button
                  variantColor="teal"
                  variant="outline"
                  type="submit"
                  width="full"
                  mt={4}
                  onClick={()=>{handleLogin()}}
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
