import React, { useEffect } from "react";
import { GoogleAuthInfo } from "../../CoveyTypes";

export default function Redirect(): JSX.Element {
    useEffect(() => {
        // get the URL parameters which will include the auth token
        const hash: string = window.location.hash.substr(1);

        type GoogleAuthResponse = {
            [key:string]: string
        };

        const authResponse: GoogleAuthResponse = hash.split('&').reduce((res, item) => {
            const parts = item.split('=');
            const [key,value] = parts;
            res [key] = value;
            return res;
        }, {} as GoogleAuthResponse);

        const googleAuthInfo: GoogleAuthInfo = {
            idToken: authResponse.id_token,
            token: authResponse.access_token
        }

        const params = {
            source: 'coveytown-google-redirect',
            payload: googleAuthInfo
        }

        if (window.opener) {
            // send them to the opening window
            window.opener.postMessage(params);
            // close the popup
            window.close();
        }
    }, []);

    return (<p>redirecting</p>);
}