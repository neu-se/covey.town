import Express from 'express';
import CORS from 'cors';
import addRoomRoutes from "./router/room";

const app = Express();
app.use(CORS());
const http = require('http').createServer(app);

addRoomRoutes(http, app);

http.listen(process.env.PORT || 8081, () => {
    console.log(`Listening on ${http.address().port}`);
})
