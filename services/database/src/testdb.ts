import DatabaseController from './db';

const db = new DatabaseController();

db.connect().then(() => {
    db.listRequestsReceived('merk1').then(res => {
        console.log(res);
        db.close();
    })
})