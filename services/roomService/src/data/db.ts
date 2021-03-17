const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://user:user@cluster0.y7ubd.mongodb.net/CoveyTown?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(
    
    // err => {
//   const collection = client.db("CoveyTown").collection("users");
  // perform actions on the collection object
//   client.close();
// }
// );
