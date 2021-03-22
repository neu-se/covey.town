import React from "react";
import { AuthState } from "../CoveyTypes";

const UserContext = React.createContext<AuthState | undefined>(undefined);
export default UserContext;