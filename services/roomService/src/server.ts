import Express from 'express';
import * as http from 'http';
import CORS from 'cors';
import { AddressInfo } from 'net';
import addTownRoutes from './router/towns';
import CoveyTownsStore from './lib/CoveyTownsStore';
import { connect } from "./database";
// import { createUser,getUserByName, updateUserByName, deleteUserByName } from './dao/user';
import { createRoom,getRoomById, updateRoomById, addAdminToRoom, deleteRoomById, RoomModel, Room } from './dao/room';
import { v4 as uuidv4 } from 'uuid';

const app = Express();
app.use(CORS());
const server = http.createServer(app);

addTownRoutes(server, app);

connect(); // make connection to mongodb

server.listen(process.env.PORT || 8081, () => {
  const address = server.address() as AddressInfo;
  // eslint-disable-next-line no-console
  console.log(`Listening on ${address.port}`);
  if (process.env.DEMO_TOWN_ID) {
    CoveyTownsStore.getInstance()
      .createTown(process.env.DEMO_TOWN_ID, false);
  }
});

// // Test User DAO
// const user_instance = {username: 'Tom', password: 'dummy-password', email: 'test@gmail.com'};
// createUser(user_instance).then(() => {
//   getUserByName('Tom').then(user => {
//     console.log('Created User Tom');
//     console.log(user);
//     updateUserByName('Tom', {born_year: 1900}).then(() => {
//       console.log('Updated User Tom');
//       getUserByName('Tom').then(user => {
//         console.log(user);
//         deleteUserByName('Tom').then(() => console.log('Deleted User Tom'));
//       });
//     });
//   });
// });

// // Test Room DAO
// const roomid = uuidv4();
// const room_instance = {roomid: roomid,roomname: 'Room', creator: 'Tom'};

// createRoom(room_instance).then(() => {
//   getRoomById(roomid).then(room => {
//     console.log('Created Room');
//     console.log(room);
//     updateRoomById(room.roomid, {password: 'passw0rd'}).then(() => {
//       console.log('Updated Room');
//       getRoomById(room.roomid).then(room => {
//         console.log(room);
//         deleteRoomById(room.roomid).then(() => console.log('Deleted Room'));
//       });
//     });
//   });
// });