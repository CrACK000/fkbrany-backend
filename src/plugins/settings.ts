import { getDb } from './db';
import { ObjectId } from 'mongodb';

interface Settings {
  _id: ObjectId;
  receiving_email: string;
}

export default async function settings(): Promise<Settings> {

  const id = new ObjectId('65dbe80314074f0012cde298')
  return await getDb().collection('settings').findOne({ _id: id }) as Settings

}