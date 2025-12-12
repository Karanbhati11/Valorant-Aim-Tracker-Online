import { MongoClient } from "mongodb";

let client: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not set");
  }

  if (client && client.topology && client.topology.isConnected()) {
    return client;
  }

  client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  return client;
}

export async function getDatabase() {
  const mongoClient = await getMongoClient();
  return mongoClient.db("aimtrainer");
}
