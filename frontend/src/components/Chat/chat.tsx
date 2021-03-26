import React, { useEffect, useState } from 'react';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';


interface ChatProps {
    token:string
  }

export default function Chat({token}:ChatProps): JSX.Element {

    const { room } = useVideoContext();

    return <h1>Hello ${token}</h1>
       
}