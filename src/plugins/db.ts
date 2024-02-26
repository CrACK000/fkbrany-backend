import { MongoClient, Db } from "mongodb";

let _db: Db;
let _client: MongoClient;

export async function connectToDb() {
  const url = process.env.DB_URL;
  _client = new MongoClient(url);
  await _client.connect();
  _db = _client.db(process.env.DB_NAME);
}

export function getDb() {
  return _db;
}

export function closeDb() {
  return _client.close();
}