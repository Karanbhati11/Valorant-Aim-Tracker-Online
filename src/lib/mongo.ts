import { MongoClient } from "mongodb";

let client: MongoClient | null = null;
let clientPromiseCache: Promise<MongoClient> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (client) {
    return client;
  }

  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  return client;
}

/**
 * Returns a cached Promise<MongoClient> suitable for use with
 * @auth/mongodb-adapter and other consumers that need a clientPromise.
 */
export function getClientPromise(): Promise<MongoClient> {
  if (!clientPromiseCache) {
    clientPromiseCache = getMongoClient();
    // Prevent a connection failure from becoming an unhandled rejection that
    // crashes the process; awaiting callers still receive the rejection.
    clientPromiseCache.catch(() => {});
  }
  return clientPromiseCache;
}

export async function getDatabase() {
  const mongoClient = await getMongoClient();
  return mongoClient.db("aimtrainer");
}
