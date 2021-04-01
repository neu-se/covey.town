import React, { useState } from 'react';
import "../Styles/Profile.css";
import {useHistory, withRouter} from 'react-router-dom';
import {
  Flex,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  CircularProgress,
  Text,
  InputGroup,
  InputRightElement,
  Icon,
  Stack,
  Center,
  Divider,
  Grid,
  GridItem,
  List, ListItem, ListIcon, OrderedList, UnorderedList
  
} from '@chakra-ui/react';
import FriendSearch from "./FriendSearch";



function ProfileComponent() {
   return(
        <Flex width="full" align="center" justifyContent="center">
      <Box p={2}
        maxWidth="2000px"
        w="90vw"
        h="80vh"
        mt={50}
        class="box-profile">
         <Stack direction={["column", "row"]} spacing="0px">
       
           <Box w="35%" h="60vh" bg="blue.500" boxShadow="lg">
                 <Heading size="md" paddingTop="20px"> <Text color="white" >Hello User</Text></Heading>
    <Flex width="full" align="center" justifyContent="center">
    <Box mt={90}>
    <Text color="white" >John Doe</Text>
                 <Text color="white" >username: john_doe</Text>
                 <Text color="white" >DOB: December 18th</Text>
                  <Button
                  variantColor="teal"
                  variant="outline"
                  type="submit"
                  width="full"
                  mt={4}
                  color="white"
                >
                                  
                     Friends            
                </Button>

     <Button
                  variantColor="teal"
                  variant="outline"
                  type="submit"
                  width="full"
                  mt={4}
                  color="white"
                >
                                  
                     Edit Profile             
                </Button>
    </Box>
    
   
    </Flex>
  </Box>
  <Box w="65%" h="60vh" bg="white">
     <Flex width="full" align="center" justifyContent="center">
               <Box mt={5}>
               <FriendSearch/>
     <Text className="bold-text"> Information</Text>
     <Divider orientation="horizontal" w="50vw" />
     <Grid templateColumns="repeat(5, 1fr)" gap={4}>
  <GridItem colSpan={2} h="10" bg="white" >
  <Text className="bold-text"> Email</Text>
   <Text> jdoe@gmail.com</Text>
  </GridItem>
  <GridItem colStart={4} colEnd={6} h="10" bg="white">
  <Text className="bold-text"> First Name</Text>
   <Text> John</Text>
  </GridItem>
</Grid>
<Grid templateColumns="repeat(5, 1fr)" gap={4} mt={10}>
  <GridItem colSpan={2} h="10" bg="white" >
  <Text className="bold-text"> Username</Text>
   <Text> jdoe-username</Text>
  </GridItem>
  <GridItem colStart={4} colEnd={6} h="10" bg="white">
  <Text className="bold-text"> Last Name</Text>
   <Text> Doe</Text>
  </GridItem>
</Grid>
<Text mt={15} className="bold-text"> Friend List</Text>
     <Divider orientation="horizontal" w="50vw" />
      <Grid templateColumns="repeat(5, 1fr)" gap={4}>
  <GridItem colSpan={2} h="10" bg="white" >
  <Text className="bold-text"> Friendlist</Text>
  
  <Text>Billie James</Text>
  <Text>Haley Scott</Text>
  <Text>Luke Millers</Text>
  <Text>Roger Smith</Text>

  </GridItem>

  <GridItem colStart={4} colEnd={6} h="10" bg="white">
  <Text className="bold-text"> Recently added</Text>
   <Text> John Smith</Text>
  </GridItem>
</Grid>
     </Box>
     </Flex>
  </Box>
  </Stack>
</Box>
        </Flex>
   )
}

export default withRouter(ProfileComponent);