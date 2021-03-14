import React from "react";
import { User } from "../CoveyTypes";

const UserContext = React.createContext<User | null>(null);
export default UserContext;