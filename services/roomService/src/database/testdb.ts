import DatabaseController from './db';

const db = new DatabaseController();

db.connect().then(() => {
    db.searchUsersByUsername('604eb8c0ebdb047600a1174b', 'merk').then(res => {
        console.log(res);
        db.close();
    });
});