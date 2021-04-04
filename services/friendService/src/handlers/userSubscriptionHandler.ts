import { Socket } from 'socket.io';

/**
 * Subscribes a user to the socket server
 * @param socket 
 */
export default function userSubscriptionHandler(socket: Socket): void {
  const { userID } = socket.handshake.auth as { userID:string };
  socket.join(userID);

  console.log(`${userID} connected `);

  /**
   * Handles the friend request and fires receiveRequest event to the recipient
   * @fires receiveRequest
   * @param recipientID 
   */
  const sendRequesthandler = (recipientID: string) => {
    socket.to(recipientID).emit('receiveRequest', userID);
  };

  socket.on('sendRequest', sendRequesthandler);

  socket.on('disconnect', ()=> {
    console.log(`${userID} disconnected`);
  });
}