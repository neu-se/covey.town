import React from 'react';
import { Heading, Text, Button } from '@chakra-ui/react';
import { useAuth0 } from "@auth0/auth0-react";
import { makeStyles, Theme } from '@material-ui/core';
import { useHistory } from "react-router-dom";
import LoginButton from '../Authentication/LoginButton'
import './splash.css'

const useStyles = makeStyles((theme: Theme) => ({
    headerContainer: {
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
        marginBottom: '90px',
        paddingBottom: '50px',
        height: '700px',
        flexDirection: 'column',
    },

    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginRight: '40px',
        marginLeft: '40px',
        marginTop: '10px',
    }

}));

export default function SplashPage() {
    document.body.classList.add('background-blue');

    const { headerContainer } = useStyles();
    const { buttonContainer } = useStyles();

    const { user, isAuthenticated } = useAuth0();
    const history = useHistory();

    function handleClick() {
        history.push("/home");
    }

    if (isAuthenticated) {
        history.push('/home');
    }
    return (
        <div style={{ backgroundColor: 'blue', height: '900px' }}>
            <div className="container">
                <div id="cloud-intro">
                    <div className={headerContainer}>
                        <Heading as="h3" fontSize="50px" color='white'>Welcome to Covey.Town!</Heading>
                        <div className={buttonContainer}><LoginButton /></div>
                        <div className={buttonContainer}><Button colorScheme="blue" onClick={handleClick}>
                            Continue as Guest
                        </Button></div>

                    </div>
                </div>
            </div>
        </div>
    );
}

