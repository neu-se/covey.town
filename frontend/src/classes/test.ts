import TownsServiceClient from './TownsServiceClient';

const client = new TownsServiceClient('http://localhost:8081');

client.searchForUsersByUsername({username: 'merk'}).then(res => {
    console.log(res);
}).catch(err => {
    console.log(err);
});