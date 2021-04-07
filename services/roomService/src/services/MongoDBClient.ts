import MongoPackage from 'mongodb';
import { CoveyTown } from '../CoveyTypes';
import IDBClient from './IDBClient';

export default class MongoDBClient implements IDBClient {
  private static _instance: MongoDBClient;

  private _coveyTownDBName: string;

  private _coveyTownCollectionName: string;

  private static _dbClient: MongoPackage.MongoClient;

  private static _uri = 'mongodb+srv://bl2pro:<password>@cluster0.bdlne.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

  private constructor() {
    
    this._coveyTownDBName = 'coveytowndb';
    this._coveyTownCollectionName = 'coveytowns';
  }

  static async getInstance(): Promise<MongoDBClient> {
    
    if (this._instance === undefined) {
      MongoDBClient._instance = new MongoDBClient(); 
      MongoDBClient._dbClient = await MongoPackage.MongoClient.connect(this._uri, { useNewUrlParser: true, useUnifiedTopology: true });
    }
    return MongoDBClient._instance;
  }
  

  async saveTown(coveyTown: CoveyTown): Promise<void> {
    const db = MongoDBClient._dbClient.db(this._coveyTownDBName);
    const collection = db.collection(this._coveyTownCollectionName);
    collection.insertOne(coveyTown);
  }
}