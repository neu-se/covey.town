import DatabaseController from './db';

const db = new DatabaseController();

db.connect().then(() => {
    db.sendRequest('604eb8c0ebdb047600a1174b', '604eb8c0ebdb047600a1174c').then(res => {
        console.log(res);
        db.sendRequest('604eb8c0ebdb047600a1174b', '604ebf69f9737177780d5929').then(res => {
            console.log(res);
            db.listRequestsSent('604eb8c0ebdb047600a1174b').then(res => {
                console.log(res);
                db.close();

            })
        })
    })
})