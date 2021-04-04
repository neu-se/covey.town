import { io } from "socket.io-client";

const socket = io('http://localhost:8082', { auth: { userID: 'test2' } });
socket.emit('sendRequest', '6065719a579a811c02557858');