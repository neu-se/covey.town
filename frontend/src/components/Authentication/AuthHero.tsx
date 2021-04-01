import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from './LoginButton';
import LogoutButton from "./LogoutButton";

export default function AuthHero() {
    const { user, isAuthenticated, isLoading } = useAuth0();
    console.log(user)

    if (isAuthenticated) {
        // replace with logged in view
        return <LogoutButton />
    } 
    
    return <LoginButton />
    

}