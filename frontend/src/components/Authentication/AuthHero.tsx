import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from './LoginButton';
import LogoutButton from "./LogoutButton";

export default function AuthHero(): JSX.Element {
    const { isAuthenticated } = useAuth0();

    if (isAuthenticated) {
        // replace with logged in view
        return <LogoutButton />
    } 
    
    return <LoginButton />
    

}