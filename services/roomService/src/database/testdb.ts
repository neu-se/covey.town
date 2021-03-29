import DatabaseController from './db';

const db = new DatabaseController();

db.connect().then(() => {
    //605d2a4cf2970d29f1e51867
    //605d2a80f2970d29f1e51868
    db.searchUsersByUsername('605d1a6abcdedd2d9770283d', 'merk').then(res => {
        console.log(res.users[5].relationship);
        db.close();
    })
});