import DatabaseController from './db';

const db = new DatabaseController();
db.connect().then(() => {
    db.listNeighbors('6059212492ab5c0004813b97').then(res => {
        console.log(res);
        db.close();
    });
})