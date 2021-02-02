import RoomServiceClient from './RoomServiceClient';

// It's OK to do console.logs here :)
/* eslint-disable no-console */

async function demoClient() {
  try {
    const client = new RoomServiceClient('http://localhost:8081/');
    const createResponse = await client.createRoom({
      friendlyName: 'Test room',
      isPubliclyListed: true,
    });
    console.log(createResponse);

    const rooms = await client.listRooms();
    console.log(rooms);
  } catch (err){
    console.trace(err);
  }
}

demoClient();

