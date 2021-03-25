import React from "react";
import { AuthInfo } from "../CoveyTypes";

const AuthInfoContext = React.createContext<AuthInfo | undefined>(undefined);
export default AuthInfoContext;