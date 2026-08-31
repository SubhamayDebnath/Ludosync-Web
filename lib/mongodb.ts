import { MongoClient, type Db } from "mongodb";

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");

  if (process.env.NODE_ENV === "development") {
    // Reuse the client across HMR reloads in dev.
    if (!global.__mongoClientPromise) {
      global.__mongoClientPromise = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 }).connect();
    }
    return global.__mongoClientPromise;
  }

  return new MongoClient(uri, { serverSelectionTimeoutMS: 5000 }).connect();
}

let cachedPromise: Promise<MongoClient> | null = null;

export async function getDb(): Promise<Db> {
  if (!cachedPromise) cachedPromise = getClientPromise();
  const client = await cachedPromise;
  return client.db();
}
