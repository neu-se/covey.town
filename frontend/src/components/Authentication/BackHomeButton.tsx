import React from "react";
import { Button } from "@chakra-ui/react"
import {useHistory} from "react-router-dom";

const BackHomeButton = () => {
  const history = useHistory();

  return <Button colorScheme="blue" onClick={() => history.push("/home")}>Home</Button>;
};

export default BackHomeButton;