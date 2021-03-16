import TownsServiceClient from './TownsServiceClient';

const client = new TownsServiceClient('http://localhost:8081');

client.createAccount({username: 'test2', password: 'testpass'}).then(res => {
    console.log(res);
}).catch(err => {
    console.log(err);
});