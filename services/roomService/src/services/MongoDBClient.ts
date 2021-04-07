import MongoPackage from 'mongodb';
import dotenv from 'dotenv';
import assert from 'assert';
import { CoveyTown } from '../CoveyTypes';
import IDBClient from './IDBClient';

dotenv.config();

export default class MongoDBClient implements IDBClient {
  private static _instance: MongoDBClient;

  private _coveyTownDBName: string;

  private _coveyTownCollectionName: string;

  private static _dbClient: MongoPackage.MongoClient;

  private static _uri = MongoDBClient.getURI();

  private constructor() {
    
    this._coveyTownDBName = 'coveytowndb';
    this._coveyTownCollectionName = 'coveytowns';
  }

  private static getURI(): string {
    const pass = process.env.MONGODB_ATLAS_PASSWORD;
    assert(pass);
    const uri = `mongodb+srv://bl2pro:${pass}@cluster0.bdlne.mongodb.net/coveytowndb?retryWrites=true&w=majority`;
    return uri;
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