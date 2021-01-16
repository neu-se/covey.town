import { Flex } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import PreJoinScreens from "../VideoCall/VideoFrontend/components/PreJoinScreens/PreJoinScreens";
import {JoinRoomResponse} from "../../classes/Video/Video";
export type doLoginF = (username: string, password: string) => Promise<boolean>;

interface LoginProps{
    doLogin: (initData: JoinRoomResponse) => Promise<boolean>
}
interface LoginFormValues{
    username: string,
    password: string,
    remember: boolean
}

export default function Login(props: LoginProps){
    const layout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
    };
    const [mediaError, setMediaError] = useState<Error>();

    const tailLayout = {
        wrapperCol: { offset: 8, span: 16 },
    };
    const onFinish = async (values: LoginFormValues) => {
        console.log(values);
        console.log('Success:', values);
    };

    return (
            <PreJoinScreens doLogin={props.doLogin} room={{id: "demoRoom", twilioID: "none"}} setMediaError={setMediaError} />
    )
}
