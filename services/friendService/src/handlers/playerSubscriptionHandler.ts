import { Socket } from 'socket.io';

export default function playerSubscriptionHandler(socket: Socket): void {
  const { userID } = socket.handshake.auth as { userID:string };
  socket.join(userID);

  console.log(`${userID} connected `);
  socket.on('sendRequest', (recipientId: string) => {
    socket.to(recipientId).emit('receiveRequest', userID);
  });

  socket.on('disconnect', ()=> {
    console.log(`${userID} disconnected`);
  });
}