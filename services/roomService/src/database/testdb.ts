import DatabaseController from './db';

const db = new DatabaseController();

db.connect().then(() => {
    //6059212492ab5c0004813b97
    db.searchUsersByUsername('604eb8c0ebdb047600a1174b', 'merkovis').then(res => {
        console.log(res);
        db.close();
    });
});