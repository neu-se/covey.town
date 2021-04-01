import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from './LoginButton';

export default function AuthHero() {
    const { user, isAuthenticated, isLoading } = useAuth0();
    // logic

    if(isAuthenticated) {
        // replace with logged in view
        return <h1>Logged in</h1>
    } 
        return <LoginButton />
    

}