import React from 'react';
import { Heading, Text , Button} from '@chakra-ui/react';
import { useAuth0 } from "@auth0/auth0-react";
import { makeStyles, Theme } from '@material-ui/core';
import { useHistory } from "react-router-dom";
import LoginButton from '../Authentication/LoginButton'


const useStyles = makeStyles((theme: Theme) => ({

}));


export default function SplashPage() {
    const { user, isAuthenticated } = useAuth0();
    const history = useHistory();

    function handleClick() {
        history.push("/home");
    }

    if(isAuthenticated){
        history.push('/home');
    }
    return (
        <div>
            <Heading as="h3" size="lg">Welcome to Covey.Town!</Heading>
            <LoginButton />
            <Button colorScheme="blue" onClick={handleClick}>
                Continue as Guest
            </Button>
        </div>
    );
}