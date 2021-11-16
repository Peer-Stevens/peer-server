import { dbConnection } from "./mongoConnection";
import type { Collection, MongoClient } from "mongodb";

export async function getCollection<T>(
	collection: "rating" | "user" | "place"
): Promise<{ _col: Collection<T>; _connection: MongoClient }> {
	const { _db: db, _connection } = await dbConnection();

	return { _col: db.collection(collection), _connection };
}
