import MongoPackage from 'mongodb';
import dotenv from 'dotenv';
import assert from 'assert';
import { CoveyTown } from '../CoveyTypes';
import IDBClient from './IDBClient';

dotenv.config();

export default class MongoAtlasClient implements IDBClient {
  private static _instance: MongoAtlasClient;

  private _coveyTownDBName: string;

  private _coveyTownCollectionName: string;

  private _dbClient: MongoPackage.MongoClient | null = null;

  private static _mongoAtlasClient: MongoAtlasClient | null = null;

  private _uri: string;

  private readonly _userPassword: string;


  private constructor() {
    this._coveyTownDBName = 'coveytowndb';
    this._coveyTownCollectionName = 'coveytowns';
    assert(process.env.MONGODB_ATLAS_PASSWORD);
    this._userPassword = process.env.MONGODB_ATLAS_PASSWORD;
    this._uri = this.setupURI();
  }

  private setupURI(): string {
    const uri = `mongodb+srv://bl2pro:${this._userPassword}@cluster0.bdlne.mongodb.net/coveytowndb?retryWrites=true&w=majority`;
    return uri;
  }

  private async dbClientSetup(): Promise<MongoPackage.MongoClient> {
    if (!this._dbClient) {
      this._dbClient = await MongoPackage.MongoClient.connect(this._uri, { useNewUrlParser: true, useUnifiedTopology: true });
    }
    return this._dbClient;
  }

  static async setup(): Promise<MongoAtlasClient> {
    let result: MongoPackage.MongoClient | null = null;
    // setup instance if it doesn't exist
    if (!MongoAtlasClient._mongoAtlasClient) {
      MongoAtlasClient._mongoAtlasClient = new MongoAtlasClient();
      /**
       * Try to setup database connection
       * Revert instance if fails
       */
      try {
        result = await MongoAtlasClient._mongoAtlasClient.dbClientSetup();
        if (!result) {
          MongoAtlasClient._mongoAtlasClient = null;
        }
      } catch (err) {
        MongoAtlasClient._mongoAtlasClient = null;
        throw err;
      }
    }


    if (!MongoAtlasClient._mongoAtlasClient) {
      throw new Error('Failed to setup MongoAtlasClient');
    }

    return MongoAtlasClient._mongoAtlasClient;
  }

  async saveTown(coveyTown: CoveyTown): Promise<void> {
    if (!this._dbClient) {
      throw new Error('Atlas DB Client not initialized');
    }

    const db = this._dbClient.db(this._coveyTownDBName);
    const collection = db.collection(this._coveyTownCollectionName);
    collection.updateOne({ coveyTownID: coveyTown.coveyTownID }, { $set: coveyTown }, { upsert: true });
  }

  async deleteTown(coveyTownID: string): Promise<void> {
    if (!this._dbClient) {
      throw new Error('Atlas DB Client not initialized');
    }

    const db = this._dbClient.db(this._coveyTownDBName);
    const collection = db.collection(this._coveyTownCollectionName);
    collection.deleteOne({ coveyTownID });
  }

  async getTowns(): Promise<CoveyTown[]> {
    if (!this._dbClient) {
      throw new Error('Atlas DB Client not initialized');
    }

    const db = this._dbClient.db(this._coveyTownDBName);
    const collection = db.collection(this._coveyTownCollectionName);
    const coveyTowns: CoveyTown[] = await collection.find({}, { projection: { _id: 0 } }).toArray();
    return coveyTowns;
  }
}